# music/urls.py
from django.urls import path
from .views import SongListView, SongDetailView, PlaylistListView, PlaylistDetailView, PlaylistAddSongView, PlaylistRemoveSongView

urlpatterns = [
    path('songs/', SongListView.as_view(), name='song-list'),
    path('songs/<int:pk>/', SongDetailView.as_view(), name='song-detail'),
    # path('songs/<int:pk>/stream/', SongStreamView.as_view(), name='song-stream'),
    # path('songs/<int:pk>/download/', SongDownloadView.as_view(), name='song-download'),
    path('playlists/', PlaylistListView.as_view(), name='playlist-list'),
    path('playlists/<int:pk>/', PlaylistDetailView.as_view(), name='playlist-detail'),
    path('playlists/<int:pk>/add-song/', PlaylistAddSongView.as_view(), name='playlist-add-song'),
    path('playlists/<int:pk>/remove-song/', PlaylistRemoveSongView.as_view(), name='playlist-remove-song'),
]