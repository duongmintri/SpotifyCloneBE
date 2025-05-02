from django.urls import path
from .views import (
    RegisterView, CustomTokenObtainPairView, UserProfileView,
    UserSearchView, FriendRequestView, FriendRequestListView,
    FriendRequestResponseView, FriendListView, FriendRemoveView,
    ChatMessageListView, ChatMessageCreateView, ChatUnreadCountView
)

urlpatterns = [
    # Đăng ký và đăng nhập
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Tìm kiếm người dùng
    path('search/', UserSearchView.as_view(), name='user-search'),

    # Quản lý bạn bè
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/remove/', FriendRemoveView.as_view(), name='friend-remove'),

    # Quản lý lời mời kết bạn
    path('friend-requests/', FriendRequestListView.as_view(), name='friend-request-list'),
    path('friend-requests/send/', FriendRequestView.as_view(), name='friend-request-send'),
    path('friend-requests/<int:request_id>/respond/', FriendRequestResponseView.as_view(), name='friend-request-respond'),

    # Chat API
    path('chat/messages/', ChatMessageListView.as_view(), name='chat-messages'),
    path('chat/messages/create/', ChatMessageCreateView.as_view(), name='chat-create'),
    path('chat/unread/', ChatUnreadCountView.as_view(), name='chat-unread'),
]