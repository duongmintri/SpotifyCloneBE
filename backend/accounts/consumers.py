import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import ChatMessage
from .serializers import ChatMessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Lấy token từ query string
            query_string = self.scope['query_string'].decode()
            print(f"Query string: {query_string}")
            
            token_parts = query_string.split('token=')
            if len(token_parts) < 2:
                print("Token không được cung cấp")
                await self.close()
                return
                
            token = token_parts[1].split('&')[0]
            print(f"Token: {token}")
            
            # Xác thực token
            user = await self.get_user_from_token(token)
            if not user:
                print(f"Không thể xác thực người dùng với token: {token}")
                await self.close()
                return
                
            self.user = user
            self.user_id = str(user.id)
            
            # Tham gia vào room cá nhân
            self.room_name = f"user_{self.user_id}"
            self.room_group_name = f"chat_{self.room_name}"
            
            print(f"Người dùng {self.user.username} (ID: {self.user_id}) đã kết nối WebSocket")
            print(f"Tham gia vào room: {self.room_group_name}")
            
            # Tham gia vào room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            print(f"Kết nối WebSocket đã được chấp nhận cho người dùng {self.user.username}")
            
            # Gửi tin nhắn xác nhận kết nối
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Kết nối WebSocket đã được thiết lập'
            }))
        except Exception as e:
            print(f"Lỗi khi kết nối WebSocket: {str(e)}")
            await self.close()
            
    async def disconnect(self, close_code):
        # Rời khỏi room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
    # Nhận tin nhắn từ WebSocket
    async def receive(self, text_data):
        try:
            print(f"Nhận dữ liệu từ WebSocket: {text_data}")
            data = json.loads(text_data)
            message_type = data.get('type', 'chat_message')
            
            if message_type == 'chat_message':
                receiver_id = data.get('receiver_id')
                content = data.get('content')
                
                if not receiver_id or not content:
                    print(f"Thiếu thông tin: receiver_id={receiver_id}, content={content}")
                    return
                
                print(f"Nhận tin nhắn từ {self.user.username} đến người dùng ID {receiver_id}: {content}")
                
                # Lưu tin nhắn vào database
                message = await self.save_message(
                    sender_id=self.user.id,
                    receiver_id=receiver_id,
                    content=content
                )
                
                if message:
                    # Tạo tên room của người nhận
                    receiver_room_name = f"user_{receiver_id}"
                    receiver_room_group = f"chat_{receiver_room_name}"
                    
                    print(f"Gửi tin nhắn đến room của người nhận: {receiver_room_group}")
                    
                    # Gửi tin nhắn đến người nhận
                    try:
                        await self.channel_layer.group_send(
                            receiver_room_group,
                            {
                                'type': 'chat_message',
                                'message': message
                            }
                        )
                        print(f"Đã gửi tin nhắn đến room của người nhận: {receiver_room_group}")
                    except Exception as e:
                        print(f"Lỗi khi gửi tin nhắn đến người nhận: {str(e)}")
                    
                    print(f"Gửi tin nhắn lại cho người gửi: {self.room_group_name}")
                    
                    # Gửi tin nhắn lại cho người gửi
                    try:
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'chat_message',
                                'message': message
                            }
                        )
                        print(f"Đã gửi tin nhắn lại cho người gửi: {self.room_group_name}")
                    except Exception as e:
                        print(f"Lỗi khi gửi tin nhắn lại cho người gửi: {str(e)}")
        except json.JSONDecodeError:
            print(f"Lỗi giải mã JSON: {text_data}")
        except Exception as e:
            print(f"Lỗi khi xử lý tin nhắn: {str(e)}")
            
    # Nhận tin nhắn từ room group
    async def chat_message(self, event):
        message = event['message']
        
        print(f"Gửi tin nhắn đến client: {message}")
        
        try:
            # Gửi tin nhắn đến WebSocket
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message
            }))
            print("Tin nhắn đã được gửi đến client thành công")
        except Exception as e:
            print(f"Lỗi khi gửi tin nhắn đến client: {str(e)}")
            
    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Giải mã token
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            # Lấy user từ database
            return User.objects.get(id=user_id)
        except (TokenError, InvalidToken, User.DoesNotExist):
            return None
            
    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        try:
            # Lấy người gửi và người nhận
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            
            # Tạo tin nhắn mới
            message = ChatMessage.objects.create(
                sender=sender,
                receiver=receiver,
                content=content,
                is_read=False
            )
            
            # Serialize tin nhắn
            serializer = ChatMessageSerializer(message)
            return serializer.data
        except User.DoesNotExist:
            return None
