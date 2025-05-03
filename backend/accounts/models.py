# accounts/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import random
from django.utils import timezone
from datetime import timedelta

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('Username must be set')
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_premium', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    full_name = models.CharField(max_length=100, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')], blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    # Thêm quan hệ many-to-many với Song cho bài hát yêu thích
    favorite_songs = models.ManyToManyField('music.Song', related_name='favorited_by', blank=True)
    # Thêm quan hệ many-to-many với User cho bạn bè
    friends = models.ManyToManyField('self', blank=True, symmetrical=True)
    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected')
    ]

    from_user = models.ForeignKey(User, related_name='sent_friend_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_friend_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'friend_requests'
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} ({self.status})"

class FriendActivity(models.Model):
    user = models.ForeignKey(User, related_name='activities', on_delete=models.CASCADE)
    song = models.ForeignKey('music.Song', related_name='activities', on_delete=models.CASCADE)
    action = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'friend_activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} {self.action}"

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:20]}..."

class PasswordResetOTP(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    @classmethod
    def generate_otp(cls, user):
        # Xóa OTP cũ chưa sử dụng
        cls.objects.filter(user=user, is_used=False).delete()
        
        # Tạo OTP mới (6 chữ số)
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Lưu OTP mới
        otp_obj = cls.objects.create(user=user, otp=otp)
        return otp_obj
    
    def is_valid(self):
        # OTP hết hạn sau 10 phút
        return (not self.is_used and 
                self.created_at >= timezone.now() - timedelta(minutes=10))
