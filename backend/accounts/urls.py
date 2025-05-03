from django.urls import path
from .views import (
    RegisterView, CustomTokenObtainPairView, UserProfileView,
    UserSearchView, FriendRequestView, FriendRequestListView,
    FriendRequestResponseView, FriendListView, FriendRemoveView,
    ChatMessageListView, ChatMessageCreateView, ChatUnreadCountView,
    premium_status, toggle_premium, ChangePasswordView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Premium features
    path('premium-status/', premium_status, name='premium_status'),
    path('toggle-premium/', toggle_premium, name='toggle_premium'),
    
    # User search
    path('search/', UserSearchView.as_view(), name='user-search'),
    
    # Friend management
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
