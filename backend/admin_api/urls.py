# admin_api/urls.py
from django.urls import path
from .views import (
    AdminLoginView, AdminUserListView,
    AdminArtistListView, AdminArtistDetailView,
    AdminAlbumListView, AdminAlbumDetailView,
    AdminSongListView, AdminSongDetailView
)

urlpatterns = [
    # Admin login
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    
    # User management
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    
    # Artist management
    path('artists/', AdminArtistListView.as_view(), name='admin-artist-list'),
    path('artists/<int:pk>/', AdminArtistDetailView.as_view(), name='admin-artist-detail'),
    
    # Album management
    path('albums/', AdminAlbumListView.as_view(), name='admin-album-list'),
    path('albums/<int:pk>/', AdminAlbumDetailView.as_view(), name='admin-album-detail'),
    
    # Song management
    path('songs/', AdminSongListView.as_view(), name='admin-song-list'),
    path('songs/<int:pk>/', AdminSongDetailView.as_view(), name='admin-song-detail'),
]
