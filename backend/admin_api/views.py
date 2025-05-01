# admin_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import mutagen
from mutagen.mp3 import MP3

from music.models import Song, Artist, Album
from accounts.models import User
from .serializers import (
    AdminUserSerializer, AdminArtistSerializer,
    AdminAlbumSerializer, AdminAlbumDetailSerializer, AdminSongSerializer
)
from .permissions import IsSuperUser
from accounts.serializers import CustomTokenObtainPairSerializer

# Admin Login View
@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # Kiểm tra xem người dùng có phải là superuser không
        if request.data.get('username'):
            try:
                user = User.objects.get(username=request.data.get('username'))
                if not user.is_superuser:
                    return Response(
                        {"detail": "Bạn không có quyền truy cập trang admin."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except User.DoesNotExist:
                pass

        return response

# User Management Views
class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        users = User.objects.all()
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

# Artist Management Views
class AdminArtistListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        artists = Artist.objects.all()
        serializer = AdminArtistSerializer(artists, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdminArtistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminArtistDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        serializer = AdminArtistSerializer(artist)
        return Response(serializer.data)

    def put(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        serializer = AdminArtistSerializer(artist, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        artist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Album Management Views
class AdminAlbumListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        albums = Album.objects.all()
        serializer = AdminAlbumSerializer(albums, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdminAlbumSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminAlbumDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        serializer = AdminAlbumDetailSerializer(album)
        return Response(serializer.data)

    def put(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        serializer = AdminAlbumSerializer(album, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        album.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Song Management Views
class AdminSongListView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        songs = Song.objects.all()
        serializer = AdminSongSerializer(songs, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Debug: In ra toàn bộ request data và files
        print("Request data:", request.data)
        print("Request FILES:", request.FILES)

        # Xử lý file MP3 được upload
        mp3_file = request.FILES.get('file')
        if not mp3_file:
            return Response({"error": "Không có file MP3 được upload"}, status=status.HTTP_400_BAD_REQUEST)

        # Lưu file tạm thời để lấy thông tin
        file_path = default_storage.save(f'temp/{mp3_file.name}', ContentFile(mp3_file.read()))
        file_full_path = os.path.join(default_storage.location, file_path)

        try:
            # Lấy thời lượng từ file MP3
            audio = MP3(file_full_path)
            duration = int(audio.info.length)  # Thời lượng tính bằng giây

            # Tạo dữ liệu cho serializer
            data = {
                'title': request.data.get('title'),
                'artist': request.data.get('artist'),
                'album': request.data.get('album') if request.data.get('album') else None,
                'duration': duration,
                'is_premium': request.data.get('is_premium', 'false').lower() == 'true',
                'cover_image': request.data.get('cover_image', '')
            }

            # Debug: In ra dữ liệu trước khi tạo serializer
            print("Data for serializer:", data)

            # Xóa file tạm
            if os.path.exists(file_full_path):
                os.remove(file_full_path)

            # Sử dụng file gốc từ request.FILES
            data['file_path'] = mp3_file

            serializer = AdminSongSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            # Nếu serializer không hợp lệ
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Xóa file tạm nếu có lỗi
            if os.path.exists(file_full_path):
                os.remove(file_full_path)
            print("Exception:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminSongDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, pk):
        song = get_object_or_404(Song, pk=pk)
        serializer = AdminSongSerializer(song)
        return Response(serializer.data)

    def put(self, request, pk):
        song = get_object_or_404(Song, pk=pk)

        # Kiểm tra xem có file mới được upload không
        mp3_file = request.FILES.get('file')
        if mp3_file:
            # Lưu file tạm thời để lấy thông tin
            file_path = default_storage.save(f'temp/{mp3_file.name}', ContentFile(mp3_file.read()))
            file_full_path = os.path.join(default_storage.location, file_path)

            try:
                # Lấy thời lượng từ file MP3
                audio = MP3(file_full_path)
                duration = int(audio.info.length)  # Thời lượng tính bằng giây

                # Tạo dữ liệu cho serializer
                data = {
                    'title': request.data.get('title', song.title),
                    'artist': request.data.get('artist', song.artist_id),
                    'album': request.data.get('album') if request.data.get('album') else song.album_id,
                    'duration': duration,
                    'is_premium': request.data.get('is_premium', song.is_premium),
                    'cover_image': request.data.get('cover_image', song.cover_image or '')
                }

                # Xóa file cũ nếu có
                old_file_path = os.path.join(default_storage.location, song.file_path)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)

                # Lưu file MP3 mới vào thư mục chính thức
                final_path = f'songs/{mp3_file.name}'
                os.rename(file_full_path, os.path.join(default_storage.location, final_path))
                data['file_path'] = final_path

                serializer = AdminSongSerializer(song, data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)

                # Nếu serializer không hợp lệ, xóa file đã upload
                os.remove(os.path.join(default_storage.location, final_path))
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                # Xóa file tạm nếu có lỗi
                if os.path.exists(file_full_path):
                    os.remove(file_full_path)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Không có file mới, chỉ cập nhật thông tin
            # Sử dụng partial update để tránh lỗi với file_path
            data = {
                'title': request.data.get('title', song.title),
                'artist': request.data.get('artist', song.artist_id),
                'album': request.data.get('album') if request.data.get('album') else song.album_id,
                'is_premium': request.data.get('is_premium', 'false').lower() == 'true',
                'cover_image': request.data.get('cover_image', song.cover_image or '')
            }

            # Debug
            print("Partial update data:", data)

            # Sử dụng partial=True để chỉ cập nhật các trường được cung cấp
            serializer = AdminSongSerializer(song, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        song = get_object_or_404(Song, pk=pk)

        try:
            # Xóa file nếu tồn tại
            if song.file_path and hasattr(song.file_path, 'path'):
                file_path = song.file_path.path
                if os.path.exists(file_path):
                    os.remove(file_path)
        except Exception as e:
            print(f"Lỗi khi xóa file: {e}")
            # Tiếp tục xóa bài hát ngay cả khi không thể xóa file

        song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
