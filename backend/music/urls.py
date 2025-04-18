# music/urls.py
from django.urls import path
from .views import SongListView, SongDetailView

urlpatterns = [
    path('songs/', SongListView.as_view(), name='song_list'),
    path('songs/<int:pk>/', SongDetailView.as_view(), name='song_detail'),
]