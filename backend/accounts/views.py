# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q, Count
from .models import User, FriendRequest, FriendActivity, ChatMessage
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    UserSearchSerializer, FriendRequestSerializer, FriendActivitySerializer,
    ChatMessageSerializer
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = CustomTokenObtainPairSerializer.get_token(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserSearchView(APIView):
    """API để tìm kiếm người dùng"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"detail": "Vui lòng nhập từ khóa để tìm kiếm"}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm kiếm người dùng theo username hoặc full_name
        users = User.objects.filter(
            Q(username__icontains=query) | Q(full_name__icontains=query)
        ).exclude(id=request.user.id)[:10]  # Giới hạn 10 kết quả

        serializer = UserSearchSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class FriendRequestView(APIView):
    """API để gửi lời mời kết bạn"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "Thiếu ID người dùng"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            to_user = User.objects.get(id=user_id)

            # Kiểm tra xem đã là bạn bè chưa
            if request.user.friends.filter(id=to_user.id).exists():
                return Response({"detail": "Đã là bạn bè"}, status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra xem đã gửi lời mời chưa (bất kể trạng thái)
            existing_request = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=to_user
            ).first()

            if existing_request:
                if existing_request.status == 'pending':
                    return Response({"detail": "Đã gửi lời mời kết bạn trước đó"}, status=status.HTTP_400_BAD_REQUEST)
                elif existing_request.status == 'rejected':
                    # Nếu lời mời đã bị từ chối trước đó, cập nhật lại thành pending
                    existing_request.status = 'pending'
                    existing_request.save()
                    return Response({
                        "detail": "Đã gửi lời mời kết bạn",
                        "request": FriendRequestSerializer(existing_request).data
                    }, status=status.HTTP_201_CREATED)
                elif existing_request.status == 'accepted':
                    # Nếu lời mời đã được chấp nhận trước đó (đã từng là bạn bè), cập nhật lại thành pending
                    existing_request.status = 'pending'
                    existing_request.save()
                    return Response({
                        "detail": "Đã gửi lời mời kết bạn",
                        "request": FriendRequestSerializer(existing_request).data
                    }, status=status.HTTP_201_CREATED)

            # Kiểm tra xem có lời mời từ người kia không (bất kể trạng thái)
            reverse_request = FriendRequest.objects.filter(
                from_user=to_user,
                to_user=request.user
            ).first()

            if reverse_request:
                if reverse_request.status == 'pending':
                    # Tự động chấp nhận lời mời
                    reverse_request.status = 'accepted'
                    reverse_request.save()

                    # Thêm vào danh sách bạn bè
                    request.user.friends.add(to_user)

                    return Response({
                        "detail": "Đã chấp nhận lời mời kết bạn",
                        "request": FriendRequestSerializer(reverse_request).data
                    })
                elif reverse_request.status == 'rejected':
                    # Nếu lời mời đã bị từ chối trước đó, tạo lời mời mới
                    # Cập nhật trạng thái của lời mời cũ
                    reverse_request.status = 'pending'
                    reverse_request.save()

                    # Đổi ngược người gửi và người nhận
                    friend_request = FriendRequest.objects.create(
                        from_user=request.user,
                        to_user=to_user
                    )

                    return Response({
                        "detail": "Đã gửi lời mời kết bạn",
                        "request": FriendRequestSerializer(friend_request).data
                    }, status=status.HTTP_201_CREATED)
                elif reverse_request.status == 'accepted':
                    # Nếu đã từng chấp nhận lời mời trước đó (đã từng là bạn bè)
                    # Cập nhật lại thành pending
                    reverse_request.status = 'pending'
                    reverse_request.save()

                    # Tạo lời mời mới từ người dùng hiện tại
                    try:
                        friend_request = FriendRequest.objects.create(
                            from_user=request.user,
                            to_user=to_user
                        )

                        return Response({
                            "detail": "Đã gửi lời mời kết bạn",
                            "request": FriendRequestSerializer(friend_request).data
                        }, status=status.HTTP_201_CREATED)
                    except Exception as e:
                        # Nếu không thể tạo lời mời mới do ràng buộc unique_together
                        return Response({
                            "detail": "Đã gửi lời mời kết bạn",
                            "request": FriendRequestSerializer(reverse_request).data
                        }, status=status.HTTP_201_CREATED)

            # Tạo lời mời kết bạn mới
            friend_request = FriendRequest.objects.create(
                from_user=request.user,
                to_user=to_user
            )

            return Response({
                "detail": "Đã gửi lời mời kết bạn",
                "request": FriendRequestSerializer(friend_request).data
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({"detail": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class FriendRequestListView(APIView):
    """API để lấy danh sách lời mời kết bạn"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy danh sách lời mời kết bạn đã nhận
        received_requests = FriendRequest.objects.filter(
            to_user=request.user,
            status='pending'
        )

        serializer = FriendRequestSerializer(received_requests, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class FriendRequestResponseView(APIView):
    """API để chấp nhận hoặc từ chối lời mời kết bạn"""
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(
                id=request_id,
                to_user=request.user,
                status='pending'
            )

            action = request.data.get('action')
            if action not in ['accept', 'reject']:
                return Response({"detail": "Hành động không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

            if action == 'accept':
                friend_request.status = 'accepted'
                friend_request.save()

                # Thêm vào danh sách bạn bè
                request.user.friends.add(friend_request.from_user)

                return Response({
                    "detail": "Đã chấp nhận lời mời kết bạn",
                    "request": FriendRequestSerializer(friend_request).data
                })
            else:
                friend_request.status = 'rejected'
                friend_request.save()

                return Response({
                    "detail": "Đã từ chối lời mời kết bạn",
                    "request": FriendRequestSerializer(friend_request).data
                })

        except FriendRequest.DoesNotExist:
            return Response({"detail": "Không tìm thấy lời mời kết bạn"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class FriendListView(APIView):
    """API để lấy danh sách bạn bè"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        friends = request.user.friends.all()
        serializer = UserSerializer(friends, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class FriendRemoveView(APIView):
    """API để xóa bạn bè"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "Thiếu ID người dùng"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = User.objects.get(id=user_id)

            # Kiểm tra xem có phải bạn bè không
            if not request.user.friends.filter(id=friend.id).exists():
                return Response({"detail": "Không phải bạn bè"}, status=status.HTTP_400_BAD_REQUEST)

            # Xóa khỏi danh sách bạn bè
            request.user.friends.remove(friend)

            return Response({"detail": "Đã xóa khỏi danh sách bạn bè"})

        except User.DoesNotExist:
            return Response({"detail": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class ChatMessageListView(APIView):
    """API để lấy danh sách tin nhắn chat với một người dùng cụ thể"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"detail": "Thiếu ID người dùng"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = User.objects.get(id=user_id)

            # Lấy tin nhắn giữa hai người dùng
            messages = ChatMessage.objects.filter(
                (Q(sender=request.user) & Q(receiver=other_user)) |
                (Q(sender=other_user) & Q(receiver=request.user))
            ).order_by('created_at')

            # Đánh dấu tin nhắn đã đọc
            unread_messages = messages.filter(receiver=request.user, is_read=False)
            for message in unread_messages:
                message.is_read = True
                message.save()

            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)

        except User.DoesNotExist:
            return Response({"detail": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class ChatMessageCreateView(APIView):
    """API để tạo tin nhắn chat mới"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Thêm sender_id từ người dùng hiện tại
        data = request.data.copy()
        data['sender_id'] = request.user.id

        serializer = ChatMessageSerializer(data=data)
        if serializer.is_valid():
            message = serializer.save()
            return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class ChatUnreadCountView(APIView):
    """API để lấy số lượng tin nhắn chưa đọc"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Đếm số tin nhắn chưa đọc
        unread_count = ChatMessage.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()

        # Đếm số tin nhắn chưa đọc theo từng người gửi
        unread_by_sender = ChatMessage.objects.filter(
            receiver=request.user,
            is_read=False
        ).values('sender').annotate(count=Count('id'))

        # Chuyển đổi kết quả thành dict với key là sender_id
        unread_dict = {item['sender']: item['count'] for item in unread_by_sender}

        return Response({
            "total_unread": unread_count,
            "unread_by_sender": unread_dict
        })

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def premium_status(request):
    """
    Endpoint để kiểm tra trạng thái premium của người dùng
    """
    user = request.user
    return Response({
        'is_premium': user.is_premium,
        'username': user.username,
        'email': user.email
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_premium(request):
    """
    Endpoint để chuyển đổi trạng thái premium của người dùng
    """
    user = request.user
    user.is_premium = not user.is_premium
    user.save()

    return Response({
        'is_premium': user.is_premium,
        'username': user.username,
        'email': user.email
    })

@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    """API để đổi mật khẩu người dùng"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Kiểm tra dữ liệu đầu vào
        if not old_password or not new_password or not confirm_password:
            return Response({"detail": "Vui lòng điền đầy đủ thông tin"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
        if new_password != confirm_password:
            return Response({"detail": "Mật khẩu mới và xác nhận mật khẩu không khớp"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra mật khẩu cũ có đúng không
        user = request.user
        if not user.check_password(old_password):
            return Response({"detail": "Mật khẩu hiện tại không đúng"}, status=status.HTTP_400_BAD_REQUEST)

        # Đổi mật khẩu
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Đổi mật khẩu thành công"}, status=status.HTTP_200_OK)
