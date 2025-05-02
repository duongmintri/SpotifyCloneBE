# music/urls.py
from django.urls import path
from .views import (
    SongListView, SongDetailView, SongDownloadView,
    PlaylistListView, PlaylistDetailView, PlaylistAddSongView, PlaylistRemoveSongView,
    AlbumListView, AlbumDetailView, AlbumAddSongView, AlbumRemoveSongView,
    FavoriteSongListView, FavoriteSongToggleView, CheckFavoriteSongView,
    SearchView, SongSearchView, AlbumSearchView, ArtistSearchView
)
from .media_views import serve_s3_file, serve_song_file, serve_song_video

urlpatterns = [
    # Song endpoints
    path('songs/', SongListView.as_view(), name='song-list'),
    path('songs/<int:pk>/', SongDetailView.as_view(), name='song-detail'),
    path('songs/<int:song_id>/stream/', serve_song_file, name='song-stream'),
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

    # Media endpoints
    path('media/<path:file_path>', serve_s3_file, name='serve-s3-file'),
    path('media/songs/<int:song_id>', serve_song_file, name='serve-song-file'),
    path('songs/<int:song_id>/video/', serve_song_video, name='song-video'),

    # Search endpoints
    path('search/', SearchView.as_view(), name='search'),
    path('songs/search/', SongSearchView.as_view(), name='song-search'),
    path('albums/search/', AlbumSearchView.as_view(), name='album-search'),
    path('artists/search/', ArtistSearchView.as_view(), name='artist-search'),
]
