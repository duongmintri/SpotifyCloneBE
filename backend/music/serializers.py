# music/serializers.py
from rest_framework import serializers
from .models import Song, Artist, Album, Playlist
from accounts.serializers import UserSerializer

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'cover_image', 'created_at']

class AlbumSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    artist_id = serializers.IntegerField(write_only=True, required=False)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'artist_id', 'user_id', 'cover_image', 'release_date', 'created_at', 'is_public', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.user == request.user
        return False

    def create(self, validated_data):
        artist_id = validated_data.pop('artist_id', None)
        user_id = validated_data.pop('user_id', None)

        # Lấy artist từ artist_id
        artist = None
        if artist_id:
            try:
                artist = Artist.objects.get(pk=artist_id)
            except Artist.DoesNotExist:
                raise serializers.ValidationError({"artist_id": "Artist không tồn tại"})

        # Tạo album mới
        album = Album.objects.create(
            artist=artist,
            user_id=user_id,
            **validated_data
        )

        return album

class SongSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    album = AlbumSerializer(read_only=True)

    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'album', 'duration', 'file_path', 'cover_image', 'is_premium', 'created_at']

class AlbumDetailSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    songs = SongSerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    artist_id = serializers.IntegerField(write_only=True, required=False)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'artist_id', 'user_id', 'cover_image', 'release_date', 'created_at', 'songs', 'is_public', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.user == request.user
        return False

class PlaylistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    songs = SongSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'user', 'songs', 'cover_image', 'is_public', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Playlist name cannot be empty.")
        return value