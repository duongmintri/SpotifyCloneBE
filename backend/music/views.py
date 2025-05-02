# music/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, StreamingHttpResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from .models import Song, Playlist, Album, Artist
from .serializers import SongSerializer, PlaylistSerializer, AlbumSerializer, AlbumDetailSerializer, ArtistSerializer
import os

def file_iterator(file_path, chunk_size=8192):
         try:
             with open(file_path, 'rb') as f:
                 while True:
                     chunk = f.read(chunk_size)
                     if not chunk:
                         break
                     yield chunk
         except FileNotFoundError:
             raise

class SongListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

class SongDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            song = Song.objects.get(pk=pk)
            serializer = SongSerializer(song)
            return Response(serializer.data)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

class SongStreamView(APIView):
    # Bỏ yêu cầu xác thực mặc định
    # permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # Lấy bài hát từ database
            song = get_object_or_404(Song, pk=pk)

            # Nếu là bài hát premium, kiểm tra người dùng
            if song.is_premium:
                if not request.user.is_authenticated:
                    return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                if not request.user.is_premium:
                    return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

            from django.conf import settings

            if settings.USE_S3:
                # Truy vấn trực tiếp database để lấy đường dẫn file
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT file_path FROM songs WHERE id = %s",
                        [song.id]
                    )
                    result = cursor.fetchone()

                    if result and result[0]:
                        file_path_db = result[0]
                        # Đảm bảo đường dẫn bắt đầu bằng media/songs
                        if not file_path_db.startswith('media/songs'):
                            if not file_path_db.startswith('songs'):
                                file_path_db = f"media/songs/{file_path_db}"
                            else:
                                file_path_db = f"media/{file_path_db}"

                        # Tạo URL trực tiếp đến file trên S3
                        file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_path_db}"
                    else:
                        # Sử dụng đường dẫn từ model nếu không tìm thấy trong database
                        file_path_name = song.file_path.name
                        if not file_path_name.startswith('media/songs'):
                            if not file_path_name.startswith('songs'):
                                file_path_name = f"media/songs/{file_path_name}"
                            else:
                                file_path_name = f"media/{file_path_name}"

                        file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_path_name}"

                # Log thông tin để debug
                print(f"Song ID: {song.id}")
                print(f"Song title: {song.title}")
                print(f"Serving song file from S3: {file_url}")

                # Trả về URL trong response JSON
                return Response({"url": file_url}, status=status.HTTP_200_OK)
            else:
                # Nếu không sử dụng S3, phục vụ file từ local storage
                file_path = song.file_path.path
                if not os.path.exists(file_path):
                    return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

                from django.http import FileResponse
                return FileResponse(
                    open(file_path, 'rb'),
                    content_type='audio/mpeg',
                    as_attachment=False,
                    filename=f"{song.title}.mp3"
                )
        except Exception as e:
            print(f"Error serving song file: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SongDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        if song.is_premium and not request.user.is_premium:
            return Response({"detail": "Premium content"}, status=status.HTTP_403_FORBIDDEN)

        from django.conf import settings

        if settings.USE_S3:
            # Nếu sử dụng S3, trả về URL trực tiếp
            file_url = song.file_path.url
            return Response({"url": file_url, "filename": f"{song.title}.mp3"}, status=status.HTTP_200_OK)
        else:
            # Nếu không sử dụng S3, sử dụng phương pháp cũ
            file_path = song.file_path.path
            if not os.path.exists(file_path):
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

            try:
                return FileResponse(
                    open(file_path, 'rb'),
                    content_type='application/octet-stream',
                    as_attachment=True,
                    filename=f"{song.title}.mp3"
                )
            except Exception as e:
                print(f"Download error: {e}")
                return Response({"detail": "Error while downloading file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlaylistListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        playlists = Playlist.objects.filter(user=request.user)
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PlaylistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlaylistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            serializer = PlaylistSerializer(playlist)
            return Response(serializer.data)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            serializer = PlaylistSerializer(playlist, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            playlist.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

class PlaylistAddSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            song_id = request.data.get('song_id')
            song = Song.objects.get(pk=song_id)
            playlist.songs.add(song)
            return Response({"detail": "Song added to playlist"})
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

class PlaylistRemoveSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=request.user)
            song_id = request.data.get('song_id')
            song = Song.objects.get(pk=song_id)
            playlist.songs.remove(song)
            return Response({"detail": "Song removed from playlist"})
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)

# Album Views
class AlbumListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy tất cả album công khai hoặc album của người dùng hiện tại
        albums = Album.objects.filter(Q(is_public=True) | Q(user=request.user))
        serializer = AlbumSerializer(albums, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        # Tạo album mới
        # Thêm user_id vào request.data
        data = request.data.copy()
        data['user_id'] = request.user.id

        serializer = AlbumSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            album = serializer.save()
            return Response(AlbumSerializer(album, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AlbumDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Lấy thông tin chi tiết album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền truy cập: album phải là công khai hoặc thuộc về người dùng hiện tại
            if not album.is_public and album.user != request.user:
                return Response({"detail": "You do not have permission to view this album"}, status=status.HTTP_403_FORBIDDEN)

            serializer = AlbumDetailSerializer(album, context={'request': request})
            return Response(serializer.data)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        # Cập nhật thông tin album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể cập nhật album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to edit this album"}, status=status.HTTP_403_FORBIDDEN)

            serializer = AlbumSerializer(album, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        # Xóa album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể xóa album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to delete this album"}, status=status.HTTP_403_FORBIDDEN)

            # Lấy tất cả các bài hát thuộc album này
            songs = Song.objects.filter(album=album)

            # Cập nhật trường album thành NULL cho tất cả các bài hát
            for song in songs:
                song.album = None
                song.save()

            # Sau đó xóa album
            album.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

# Album Song Management Views
class AlbumAddSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Thêm bài hát vào album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể thêm bài hát vào album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id)
                # Thêm bài hát vào album
                song.album = album
                song.save()
                return Response({"detail": "Song added to album", "song": SongSerializer(song).data})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

class AlbumRemoveSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Xóa bài hát khỏi album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể xóa bài hát khỏi album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id, album=album)
                # Xóa bài hát khỏi album
                song.album = None
                song.save()
                return Response({"detail": "Song removed from album"})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found in this album"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

# Album Song Management Views
class AlbumAddSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Thêm bài hát vào album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể thêm bài hát vào album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id)
                # Thêm bài hát vào album
                song.album = album
                song.save()
                return Response({"detail": "Song added to album", "song": SongSerializer(song).data})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

class AlbumRemoveSongView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Xóa bài hát khỏi album
        try:
            album = Album.objects.get(pk=pk)
            # Kiểm tra quyền: chỉ chủ sở hữu mới có thể xóa bài hát khỏi album
            if album.user != request.user:
                return Response({"detail": "You do not have permission to modify this album"}, status=status.HTTP_403_FORBIDDEN)

            song_id = request.data.get('song_id')
            if not song_id:
                return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                song = Song.objects.get(pk=song_id, album=album)
                # Xóa bài hát khỏi album
                song.album = None
                song.save()
                return Response({"detail": "Song removed from album"})
            except Song.DoesNotExist:
                return Response({"detail": "Song not found in this album"}, status=status.HTTP_404_NOT_FOUND)
        except Album.DoesNotExist:
            return Response({"detail": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

# Search Views
class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"detail": "Vui lòng nhập từ khóa để tìm kiếm"}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm kiếm bài hát
        songs = Song.objects.filter(
            Q(title__icontains=query) |
            Q(artist__name__icontains=query)
        )[:10]  # Giới hạn 10 kết quả

        # Tìm kiếm album
        albums = Album.objects.filter(
            Q(title__icontains=query) |
            Q(artist__name__icontains=query)
        ).filter(Q(is_public=True) | Q(user=request.user))[:10]  # Giới hạn 10 kết quả

        # Tìm kiếm nghệ sĩ
        artists = Artist.objects.filter(
            name__icontains=query
        )[:10]  # Giới hạn 10 kết quả

        # Trả về kết quả
        return Response({
            "songs": SongSerializer(songs, many=True).data,
            "albums": AlbumSerializer(albums, many=True, context={'request': request}).data,
            "artists": ArtistSerializer(artists, many=True).data
        })

# Song Search View
class SongSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"detail": "Vui lòng nhập từ khóa để tìm kiếm"}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm kiếm bài hát
        songs = Song.objects.filter(
            Q(title__icontains=query) |
            Q(artist__name__icontains=query)
        )[:20]  # Giới hạn 20 kết quả

        return Response(SongSerializer(songs, many=True).data)

# Album Search View
class AlbumSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"detail": "Vui lòng nhập từ khóa để tìm kiếm"}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm kiếm album
        albums = Album.objects.filter(
            Q(title__icontains=query) |
            Q(artist__name__icontains=query)
        ).filter(Q(is_public=True) | Q(user=request.user))[:20]  # Giới hạn 20 kết quả

        return Response(AlbumSerializer(albums, many=True, context={'request': request}).data)

# Artist Search View
class ArtistSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"detail": "Vui lòng nhập từ khóa để tìm kiếm"}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm kiếm nghệ sĩ
        artists = Artist.objects.filter(
            name__icontains=query
        )[:20]  # Giới hạn 20 kết quả

        return Response(ArtistSerializer(artists, many=True).data)

# Favorite Songs Views
class FavoriteSongListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy danh sách bài hát yêu thích của người dùng
        user = request.user
        favorite_songs = user.favorite_songs.all()
        serializer = SongSerializer(favorite_songs, many=True)
        return Response(serializer.data)

class FavoriteSongToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Thêm/xóa bài hát khỏi danh sách yêu thích
        print("FavoriteSongToggleView - POST request received")
        print("Request data:", request.data)
        print("User:", request.user.username)

        song_id = request.data.get('song_id')
        print("Song ID from request:", song_id)

        if not song_id:
            print("Song ID is missing")
            return Response({"detail": "Song ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            song = Song.objects.get(pk=song_id)
            print("Song found:", song.title)

            user = request.user
            print("User favorite songs count:", user.favorite_songs.count())

            # Kiểm tra xem bài hát đã có trong danh sách yêu thích chưa
            is_favorite = song in user.favorite_songs.all()
            print("Is song already in favorites:", is_favorite)

            if is_favorite:
                # Nếu có, xóa khỏi danh sách yêu thích
                print("Removing song from favorites")
                user.favorite_songs.remove(song)
                return Response({"detail": "Song removed from favorites", "is_favorite": False})
            else:
                # Nếu chưa, thêm vào danh sách yêu thích
                print("Adding song to favorites")
                user.favorite_songs.add(song)
                return Response({"detail": "Song added to favorites", "is_favorite": True})
        except Song.DoesNotExist:
            print("Song not found with ID:", song_id)
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Unexpected error:", str(e))
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CheckFavoriteSongView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Kiểm tra xem bài hát có trong danh sách yêu thích không
        try:
            song = Song.objects.get(pk=pk)
            user = request.user
            is_favorite = song in user.favorite_songs.all()
            return Response({"is_favorite": is_favorite})
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
