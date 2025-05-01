# admin_api/serializers.py
from rest_framework import serializers
from music.models import Song, Artist, Album
from accounts.models import User

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'gender', 'date_of_birth', 
                  'is_premium', 'is_superuser', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AdminArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'cover_image', 'created_at']

class AdminAlbumSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source='artist.name', read_only=True)
    
    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'artist_name', 'cover_image', 'release_date', 
                  'created_at', 'is_public', 'user']
        
class AdminAlbumDetailSerializer(serializers.ModelSerializer):
    artist = AdminArtistSerializer(read_only=True)
    
    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'cover_image', 'release_date', 
                  'created_at', 'is_public', 'user']

class AdminSongSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source='artist.name', read_only=True)
    album_title = serializers.CharField(source='album.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'artist_name', 'album', 'album_title', 
                  'duration', 'file_path', 'is_premium', 'cover_image', 'created_at']
