# music/urls.py
from django.urls import path
from .views import (
    SongListView, SongDetailView, SongStreamView, SongDownloadView,
    PlaylistListView, PlaylistDetailView, PlaylistAddSongView, PlaylistRemoveSongView,
    AlbumListView, AlbumDetailView, AlbumAddSongView, AlbumRemoveSongView,
    FavoriteSongListView, FavoriteSongToggleView, CheckFavoriteSongView
)

urlpatterns = [
    # Song endpoints
    path('songs/', SongListView.as_view(), name='song-list'),
    path('songs/<int:pk>/', SongDetailView.as_view(), name='song-detail'),
    path('songs/<int:pk>/stream/', SongStreamView.as_view(), name='song-stream'),
    path('songs/<int:pk>/download/', SongDownloadView.as_view(), name='song-download'),

    # Playlist endpoints
    path('playlists/', PlaylistListView.as_view(), name='playlist-list'),
    path('playlists/<int:pk>/', PlaylistDetailView.as_view(), name='playlist-detail'),
    path('playlists/<int:pk>/add-song/', PlaylistAddSongView.as_view(), name='playlist-add-song'),
    path('playlists/<int:pk>/remove-song/', PlaylistRemoveSongView.as_view(), name='playlist-remove-song'),

    # Album endpoints
    path('albums/', AlbumListView.as_view(), name='album-list'),
    path('albums/<int:pk>/', AlbumDetailView.as_view(), name='album-detail'),
    path('albums/<int:pk>/add-song/', AlbumAddSongView.as_view(), name='album-add-song'),
    path('albums/<int:pk>/remove-song/', AlbumRemoveSongView.as_view(), name='album-remove-song'),

    # Favorite songs endpoints
    path('favorites/', FavoriteSongListView.as_view(), name='favorite-list'),
    path('favorites/toggle/', FavoriteSongToggleView.as_view(), name='favorite-toggle'),
    path('favorites/check/<int:pk>/', CheckFavoriteSongView.as_view(), name='favorite-check'),
]