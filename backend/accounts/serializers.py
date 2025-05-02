# accounts/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, FriendRequest, FriendActivity, ChatMessage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'gender', 'date_of_birth', 'is_premium', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer cho kết quả tìm kiếm người dùng"""
    is_friend = serializers.SerializerMethodField()
    has_pending_request = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'is_friend', 'has_pending_request']

    def get_is_friend(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.friends.filter(id=obj.id).exists()
        return False

    def get_has_pending_request(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Kiểm tra xem đã gửi lời mời kết bạn chưa
            return FriendRequest.objects.filter(
                from_user=request.user,
                to_user=obj,
                status='pending'
            ).exists() or FriendRequest.objects.filter(
                from_user=obj,
                to_user=request.user,
                status='pending'
            ).exists()
        return False

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'gender', 'date_of_birth']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            gender=validated_data.get('gender'),
            date_of_birth=validated_data.get('date_of_birth')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_premium'] = user.is_premium
        return token

    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            data['user'] = UserSerializer(self.user).data
            return data
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class FriendActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    song = serializers.SerializerMethodField()

    class Meta:
        model = FriendActivity
        fields = ['id', 'user', 'song', 'action', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_song(self, obj):
        from music.serializers import SongSerializer
        return SongSerializer(obj.song).data

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True)
    receiver_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'receiver', 'sender_id', 'receiver_id', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        sender_id = validated_data.pop('sender_id')
        receiver_id = validated_data.pop('receiver_id')

        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("Người dùng không tồn tại")

        message = ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            **validated_data
        )

        return message