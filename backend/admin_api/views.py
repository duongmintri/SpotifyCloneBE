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
from django.conf import settings
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
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        albums = Album.objects.all()
        serializer = AdminAlbumSerializer(albums, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Debug: In ra toàn bộ request data và files
        print("Request data:", request.data)
        print("Request FILES:", request.FILES)

        # Xử lý file ảnh cover nếu có
        cover_file = request.FILES.get('cover_image')

        # Tạo dữ liệu cho serializer
        data = {
            'title': request.data.get('title'),
            'artist': request.data.get('artist') or request.data.get('artist_id'),  # Thử lấy cả artist và artist_id
            'release_date': request.data.get('release_date'),
            'is_public': request.data.get('is_public', 'true').lower() == 'true',
            'cover_image': ''  # Mặc định là chuỗi rỗng, sẽ được cập nhật nếu có file
        }

        # Debug: In ra artist_id và artist
        print("Artist ID:", request.data.get('artist_id'))
        print("Artist:", request.data.get('artist'))

        # Nếu có file ảnh cover
        if cover_file:
            try:
                # Tạo thư mục tạm nếu chưa tồn tại
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                # Lưu file tạm thời
                cover_temp_path = os.path.join(temp_dir, cover_file.name)
                with open(cover_temp_path, 'wb+') as destination:
                    for chunk in cover_file.chunks():
                        destination.write(chunk)

                # Nếu sử dụng S3, upload file trực tiếp lên S3
                if settings.USE_S3:
                    import boto3
                    from botocore.exceptions import ClientError
                    import uuid

                    # Tạo kết nối với S3
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )

                    # Tạo một tên file ngẫu nhiên để tránh xung đột
                    random_suffix = str(uuid.uuid4())[:8]
                    cover_name = f"{os.path.splitext(cover_file.name)[0]}_{random_suffix}{os.path.splitext(cover_file.name)[1]}"
                    cover_s3_key = f"media/images/{cover_name}"

                    try:
                        # Upload file ảnh cover lên S3
                        print(f"Uploading cover image to S3: {cover_s3_key}")
                        s3_client.upload_file(
                            cover_temp_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            cover_s3_key
                        )
                        print(f"Cover image uploaded successfully to S3: {cover_s3_key}")

                        # Cập nhật URL ảnh cover
                        cover_s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{cover_s3_key}"
                        data['cover_image'] = cover_s3_url

                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)
                    except ClientError as e:
                        print(f"Error uploading cover image to S3: {e}")
                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)
                        return Response({"error": f"Error uploading cover image to S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    # Nếu không sử dụng S3, sử dụng file gốc
                    data['cover_image'] = cover_file
            except Exception as e:
                print(f"Error processing cover image: {e}")
                import traceback
                traceback.print_exc()
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Debug: In ra dữ liệu trước khi tạo serializer
        print("Data for serializer:", data)

        serializer = AdminAlbumSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Nếu serializer không hợp lệ
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminAlbumDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, pk):
        album = get_object_or_404(Album, pk=pk)
        serializer = AdminAlbumDetailSerializer(album)
        return Response(serializer.data)

    def put(self, request, pk):
        album = get_object_or_404(Album, pk=pk)

        # Debug: In ra toàn bộ request data và files
        print("Request data:", request.data)
        print("Request FILES:", request.FILES)

        # Xử lý file ảnh cover nếu có
        cover_file = request.FILES.get('cover_image')

        # Tạo dữ liệu cho serializer
        data = {
            'title': request.data.get('title', album.title),
            'artist': request.data.get('artist') or request.data.get('artist_id', album.artist_id),  # Thử lấy cả artist và artist_id
            'release_date': request.data.get('release_date', album.release_date),
            'is_public': request.data.get('is_public', 'true').lower() == 'true',
            'cover_image': album.cover_image or ''  # Đảm bảo không phải None
        }

        # Debug: In ra artist_id và artist
        print("Artist ID:", request.data.get('artist_id'))
        print("Artist:", request.data.get('artist'))

        # Nếu có file ảnh cover
        if cover_file:
            try:
                # Tạo thư mục tạm nếu chưa tồn tại
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                # Lưu file tạm thời
                cover_temp_path = os.path.join(temp_dir, cover_file.name)
                with open(cover_temp_path, 'wb+') as destination:
                    for chunk in cover_file.chunks():
                        destination.write(chunk)

                # Nếu sử dụng S3, upload file trực tiếp lên S3
                if settings.USE_S3:
                    import boto3
                    from botocore.exceptions import ClientError
                    import uuid

                    # Tạo kết nối với S3
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )

                    # Tạo một tên file ngẫu nhiên để tránh xung đột
                    random_suffix = str(uuid.uuid4())[:8]
                    cover_name = f"{os.path.splitext(cover_file.name)[0]}_{random_suffix}{os.path.splitext(cover_file.name)[1]}"
                    cover_s3_key = f"media/images/{cover_name}"

                    try:
                        # Upload file ảnh cover lên S3
                        print(f"Uploading cover image to S3: {cover_s3_key}")
                        s3_client.upload_file(
                            cover_temp_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            cover_s3_key
                        )
                        print(f"Cover image uploaded successfully to S3: {cover_s3_key}")

                        # Cập nhật URL ảnh cover
                        cover_s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{cover_s3_key}"
                        data['cover_image'] = cover_s3_url

                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)
                    except ClientError as e:
                        print(f"Error uploading cover image to S3: {e}")
                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)
                        return Response({"error": f"Error uploading cover image to S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    # Nếu không sử dụng S3, sử dụng file gốc
                    data['cover_image'] = cover_file
            except Exception as e:
                print(f"Error processing cover image: {e}")
                import traceback
                traceback.print_exc()
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Debug: In ra dữ liệu trước khi tạo serializer
        print("Data for serializer:", data)

        serializer = AdminAlbumSerializer(album, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        # Nếu serializer không hợp lệ
        print("Serializer errors:", serializer.errors)
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

        # Xử lý file ảnh cover nếu có
        cover_file = request.FILES.get('cover_image')

        # Xử lý file video nếu có
        video_file = request.FILES.get('video')

        try:
            # Tạo thư mục tạm nếu chưa tồn tại
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
            if not os.path.exists(temp_dir):
                os.makedirs(temp_dir)

            # Lưu file tạm thời để lấy thông tin
            temp_file_path = os.path.join(temp_dir, mp3_file.name)
            with open(temp_file_path, 'wb+') as destination:
                for chunk in mp3_file.chunks():
                    destination.write(chunk)

            # Lấy thời lượng từ file MP3
            audio = MP3(temp_file_path)
            duration = int(audio.info.length)  # Thời lượng tính bằng giây

            # Tạo dữ liệu cho serializer
            data = {
                'title': request.data.get('title'),
                'artist': request.data.get('artist'),
                'album': request.data.get('album') if request.data.get('album') else None,
                'duration': duration,
                'is_premium': request.data.get('is_premium', 'false').lower() == 'true',
                'cover_image': request.data.get('cover_image', ''),
                'video': None
            }

            # Debug: In ra dữ liệu trước khi tạo serializer
            print("Data for serializer:", data)

            # Nếu sử dụng S3, upload file trực tiếp lên S3 bằng boto3
            if settings.USE_S3:
                import boto3
                from botocore.exceptions import ClientError
                import uuid

                # Tạo kết nối với S3
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )

                # Tạo một tên file ngẫu nhiên để tránh xung đột
                random_suffix = str(uuid.uuid4())[:8]

                # Xử lý file MP3
                file_name = f"{os.path.splitext(mp3_file.name)[0]}_{random_suffix}{os.path.splitext(mp3_file.name)[1]}"
                s3_key = f"media/songs/{file_name}"

                # Xử lý file ảnh cover nếu có
                cover_s3_key = None
                cover_s3_url = None
                if 'cover_image' in request.FILES:
                    cover_file = request.FILES['cover_image']
                    cover_name = f"{os.path.splitext(cover_file.name)[0]}_{random_suffix}{os.path.splitext(cover_file.name)[1]}"
                    cover_s3_key = f"media/images/{cover_name}"

                    # Lưu file tạm thời
                    cover_temp_path = os.path.join(temp_dir, cover_file.name)
                    with open(cover_temp_path, 'wb+') as destination:
                        for chunk in cover_file.chunks():
                            destination.write(chunk)

                # Xử lý file video nếu có
                video_s3_key = None
                if 'video' in request.FILES:
                    video_file = request.FILES['video']
                    video_name = f"{os.path.splitext(video_file.name)[0]}_{random_suffix}{os.path.splitext(video_file.name)[1]}"
                    video_s3_key = f"media/videos/{video_name}"

                    # Lưu file tạm thời
                    video_temp_path = os.path.join(temp_dir, video_file.name)
                    with open(video_temp_path, 'wb+') as destination:
                        for chunk in video_file.chunks():
                            destination.write(chunk)

                try:
                    # Upload file MP3 lên S3
                    print(f"Uploading file to S3: {s3_key}")
                    s3_client.upload_file(
                        temp_file_path,
                        settings.AWS_STORAGE_BUCKET_NAME,
                        s3_key
                    )
                    print(f"File uploaded successfully to S3: {s3_key}")

                    # Tạo URL để truy cập file
                    s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{s3_key}"
                    print(f"S3 URL: {s3_url}")

                    # Xóa file tạm
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)

                    # Upload file ảnh cover lên S3 nếu có
                    if 'cover_image' in request.FILES and cover_s3_key:
                        print(f"Uploading cover image to S3: {cover_s3_key}")
                        s3_client.upload_file(
                            cover_temp_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            cover_s3_key
                        )
                        print(f"Cover image uploaded successfully to S3: {cover_s3_key}")

                        # Cập nhật URL ảnh cover
                        cover_s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{cover_s3_key}"
                        data['cover_image'] = cover_s3_url

                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)

                    # Upload file video lên S3 nếu có
                    if 'video' in request.FILES and video_s3_key:
                        print(f"Uploading video to S3: {video_s3_key}")
                        s3_client.upload_file(
                            video_temp_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            video_s3_key
                        )
                        print(f"Video uploaded successfully to S3: {video_s3_key}")

                        # Xóa file tạm
                        if os.path.exists(video_temp_path):
                            os.remove(video_temp_path)

                    # Tạo bài hát trực tiếp trong database
                    from django.core.files.base import ContentFile
                    from django.db import connection

                    # Tạo bài hát trực tiếp bằng SQL
                    try:
                        with connection.cursor() as cursor:
                            cursor.execute(
                                """
                                INSERT INTO songs
                                (title, artist_id, album_id, duration, file_path, is_premium, cover_image, video, created_at)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                                RETURNING id
                                """,
                                [
                                    data['title'],
                                    data['artist'],
                                    data['album'],
                                    data['duration'],
                                    s3_key,
                                    data['is_premium'],
                                    data['cover_image'] or '',
                                    video_s3_key,
                                ]
                            )
                            song_id = cursor.fetchone()[0]

                        # Lấy bài hát vừa tạo
                        song = Song.objects.get(id=song_id)
                        print(f"Song created successfully. File path: {s3_key}")

                        # Trả về thông tin bài hát
                        serializer = AdminSongSerializer(song)
                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                    except Exception as e:
                        print(f"Error creating song: {e}")
                        # Xóa file trên S3
                        try:
                            s3_client.delete_object(
                                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                                Key=s3_key
                            )
                            print(f"Deleted file from S3 due to database error: {s3_key}")
                        except Exception as e2:
                            print(f"Error deleting file from S3: {e2}")

                        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

                except ClientError as e:
                    print(f"Error uploading file to S3: {e}")
                    # Xóa file tạm
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)
                    return Response({"error": f"Error uploading file to S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Nếu không sử dụng S3, sử dụng file gốc từ request.FILES
                # Xóa file tạm
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

                data['file_path'] = mp3_file

                serializer = AdminSongSerializer(data=data)
                if serializer.is_valid():
                    song = serializer.save()
                    print(f"Song created successfully. File path: {song.file_path.path}")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                # Nếu serializer không hợp lệ
                print("Serializer errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Xóa file tạm nếu có lỗi
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            print("Exception:", str(e))
            import traceback
            traceback.print_exc()
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

        # Xử lý file ảnh cover nếu có
        cover_file = request.FILES.get('cover_image')

        # Xử lý file video nếu có
        video_file = request.FILES.get('video')

        if mp3_file:
            try:
                # Tạo thư mục tạm nếu chưa tồn tại
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                # Lưu file tạm thời để lấy thông tin
                temp_file_path = os.path.join(temp_dir, mp3_file.name)
                with open(temp_file_path, 'wb+') as destination:
                    for chunk in mp3_file.chunks():
                        destination.write(chunk)

                # Lấy thời lượng từ file MP3
                audio = MP3(temp_file_path)
                duration = int(audio.info.length)  # Thời lượng tính bằng giây

                # Tạo dữ liệu cho serializer
                data = {
                    'title': request.data.get('title', song.title),
                    'artist': request.data.get('artist', song.artist_id),
                    'album': request.data.get('album') if request.data.get('album') else song.album_id,
                    'duration': duration,
                    'is_premium': request.data.get('is_premium', 'false').lower() == 'true',
                    'cover_image': request.data.get('cover_image', song.cover_image or ''),
                    'video': song.video
                }

                # Nếu sử dụng S3, upload file trực tiếp lên S3 bằng boto3
                if settings.USE_S3:
                    import boto3
                    from botocore.exceptions import ClientError
                    import uuid

                    # Tạo kết nối với S3
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )

                    # Tạo một tên file ngẫu nhiên để tránh xung đột
                    random_suffix = str(uuid.uuid4())[:8]

                    # Xử lý file MP3
                    file_name = f"{os.path.splitext(mp3_file.name)[0]}_{random_suffix}{os.path.splitext(mp3_file.name)[1]}"
                    s3_key = f"media/songs/{file_name}"

                    # Xử lý file ảnh cover nếu có
                    cover_s3_key = None
                    if cover_file:
                        cover_name = f"{os.path.splitext(cover_file.name)[0]}_{random_suffix}{os.path.splitext(cover_file.name)[1]}"
                        cover_s3_key = f"media/images/{cover_name}"

                        # Lưu file tạm thời
                        cover_temp_path = os.path.join(temp_dir, cover_file.name)
                        with open(cover_temp_path, 'wb+') as destination:
                            for chunk in cover_file.chunks():
                                destination.write(chunk)

                    # Xử lý file video nếu có
                    video_s3_key = None
                    if video_file:
                        video_name = f"{os.path.splitext(video_file.name)[0]}_{random_suffix}{os.path.splitext(video_file.name)[1]}"
                        video_s3_key = f"media/videos/{video_name}"

                        # Lưu file tạm thời
                        video_temp_path = os.path.join(temp_dir, video_file.name)
                        with open(video_temp_path, 'wb+') as destination:
                            for chunk in video_file.chunks():
                                destination.write(chunk)

                    try:
                        # Upload file MP3 lên S3
                        print(f"Uploading file to S3: {s3_key}")
                        s3_client.upload_file(
                            temp_file_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            s3_key
                        )
                        print(f"File uploaded successfully to S3: {s3_key}")

                        # Tạo URL để truy cập file
                        s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{s3_key}"
                        print(f"S3 URL: {s3_url}")

                        # Xóa file tạm
                        if os.path.exists(temp_file_path):
                            os.remove(temp_file_path)

                        # Upload file ảnh cover lên S3 nếu có
                        if cover_file and cover_s3_key:
                            print(f"Uploading cover image to S3: {cover_s3_key}")
                            s3_client.upload_file(
                                cover_temp_path,
                                settings.AWS_STORAGE_BUCKET_NAME,
                                cover_s3_key
                            )
                            print(f"Cover image uploaded successfully to S3: {cover_s3_key}")

                            # Cập nhật URL ảnh cover
                            cover_s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{cover_s3_key}"
                            data['cover_image'] = cover_s3_url

                            # Xóa file tạm
                            if os.path.exists(cover_temp_path):
                                os.remove(cover_temp_path)

                        # Upload file video lên S3 nếu có
                        if video_file and video_s3_key:
                            print(f"Uploading video to S3: {video_s3_key}")
                            s3_client.upload_file(
                                video_temp_path,
                                settings.AWS_STORAGE_BUCKET_NAME,
                                video_s3_key
                            )
                            print(f"Video uploaded successfully to S3: {video_s3_key}")

                            # Xóa file tạm
                            if os.path.exists(video_temp_path):
                                os.remove(video_temp_path)

                        # Xóa file cũ trên S3 nếu có
                        if song.file_path:
                            try:
                                old_key = song.file_path.name
                                s3_client.delete_object(
                                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                                    Key=old_key
                                )
                                print(f"Deleted old file from S3: {old_key}")
                            except Exception as e:
                                print(f"Error deleting old file from S3: {e}")

                        # Cập nhật bài hát trực tiếp trong database
                        from django.db import connection

                        # Cập nhật bài hát trực tiếp bằng SQL
                        try:
                            with connection.cursor() as cursor:
                                cursor.execute(
                                    """
                                    UPDATE songs
                                    SET title = %s, artist_id = %s, album_id = %s, duration = %s,
                                        file_path = %s, is_premium = %s, cover_image = %s, video = %s
                                    WHERE id = %s
                                    """,
                                    [
                                        data['title'],
                                        data['artist'],
                                        data['album'],
                                        data['duration'],
                                        s3_key,
                                        data['is_premium'],
                                        data['cover_image'] or '',
                                        video_s3_key,
                                        song.id
                                    ]
                                )

                            # Lấy bài hát vừa cập nhật
                            updated_song = Song.objects.get(id=song.id)
                            print(f"Song updated successfully. File path: {s3_key}")

                            # Trả về thông tin bài hát
                            serializer = AdminSongSerializer(updated_song)
                            return Response(serializer.data)
                        except Exception as e:
                            print(f"Error updating song: {e}")
                            # Xóa file trên S3
                            try:
                                s3_client.delete_object(
                                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                                    Key=s3_key
                                )
                                print(f"Deleted file from S3 due to database error: {s3_key}")
                            except Exception as e2:
                                print(f"Error deleting file from S3: {e2}")

                            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

                    except ClientError as e:
                        print(f"Error uploading file to S3: {e}")
                        # Xóa file tạm
                        if os.path.exists(temp_file_path):
                            os.remove(temp_file_path)
                        return Response({"error": f"Error uploading file to S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    # Nếu không sử dụng S3, sử dụng file gốc từ request.FILES
                    # Xóa file tạm
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)

                    data['file_path'] = mp3_file

                    serializer = AdminSongSerializer(song, data=data)
                    if serializer.is_valid():
                        updated_song = serializer.save()
                        print(f"Song updated successfully. File path: {updated_song.file_path.path}")
                        return Response(serializer.data)

                    # Nếu serializer không hợp lệ
                    print("Serializer errors:", serializer.errors)
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                # Xóa file tạm nếu có lỗi
                if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                print("Exception:", str(e))
                import traceback
                traceback.print_exc()
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

            # Xử lý file ảnh cover nếu có
            if cover_file:
                # Tạo thư mục tạm nếu chưa tồn tại
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                # Lưu file tạm thời
                cover_temp_path = os.path.join(temp_dir, cover_file.name)
                with open(cover_temp_path, 'wb+') as destination:
                    for chunk in cover_file.chunks():
                        destination.write(chunk)

                # Nếu sử dụng S3, upload file trực tiếp lên S3
                if settings.USE_S3:
                    import boto3
                    from botocore.exceptions import ClientError
                    import uuid

                    # Tạo kết nối với S3
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )

                    # Tạo một tên file ngẫu nhiên để tránh xung đột
                    random_suffix = str(uuid.uuid4())[:8]
                    cover_name = f"{os.path.splitext(cover_file.name)[0]}_{random_suffix}{os.path.splitext(cover_file.name)[1]}"
                    cover_s3_key = f"media/images/{cover_name}"

                    try:
                        # Upload file ảnh cover lên S3
                        print(f"Uploading cover image to S3: {cover_s3_key}")
                        s3_client.upload_file(
                            cover_temp_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            cover_s3_key
                        )
                        print(f"Cover image uploaded successfully to S3: {cover_s3_key}")

                        # Cập nhật URL ảnh cover
                        cover_s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{cover_s3_key}"
                        data['cover_image'] = cover_s3_url

                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)
                    except ClientError as e:
                        print(f"Error uploading cover image to S3: {e}")
                        # Xóa file tạm
                        if os.path.exists(cover_temp_path):
                            os.remove(cover_temp_path)
                        return Response({"error": f"Error uploading cover image to S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    # Nếu không sử dụng S3, sử dụng file gốc
                    data['cover_image'] = cover_file

            # Xử lý file video nếu có
            if video_file:
                # Tạo thư mục tạm nếu chưa tồn tại
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                # Lưu file tạm thời
                video_temp_path = os.path.join(temp_dir, video_file.name)
                with open(video_temp_path, 'wb+') as destination:
                    for chunk in video_file.chunks():
                        destination.write(chunk)

                # Nếu sử dụng S3, upload file trực tiếp lên S3
                if settings.USE_S3:
                    import boto3
                    from botocore.exceptions import ClientError
                    import uuid

                    # Tạo kết nối với S3 (nếu chưa tạo)
                    if 's3_client' not in locals():
                        s3_client = boto3.client(
                            's3',
                            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                            region_name=settings.AWS_S3_REGION_NAME
                        )

                    # Tạo một tên file ngẫu nhiên để tránh xung đột
                    random_suffix = str(uuid.uuid4())[:8]
                    video_name = f"{os.path.splitext(video_file.name)[0]}_{random_suffix}{os.path.splitext(video_file.name)[1]}"
                    video_s3_key = f"media/videos/{video_name}"

                    try:
                        # Upload file video lên S3
                        print(f"Uploading video to S3: {video_s3_key}")
                        s3_client.upload_file(
                            video_temp_path,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            video_s3_key
                        )
                        print(f"Video uploaded successfully to S3: {video_s3_key}")

                        # Cập nhật trường video
                        data['video'] = video_s3_key

                        # Xóa file tạm
                        if os.path.exists(video_temp_path):
                            os.remove(video_temp_path)
                    except ClientError as e:
                        print(f"Error uploading video to S3: {e}")
                        # Xóa file tạm
                        if os.path.exists(video_temp_path):
                            os.remove(video_temp_path)
                        return Response({"error": f"Error uploading video to S3: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
                    # Nếu không sử dụng S3, sử dụng file gốc
                    data['video'] = video_file

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
            # Xóa file
            if song.file_path:
                if settings.USE_S3:
                    # Nếu sử dụng S3, xóa file trực tiếp bằng boto3
                    import boto3
                    from botocore.exceptions import ClientError

                    # Tạo kết nối với S3
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )

                    try:
                        # Xóa file trên S3
                        s3_key = song.file_path.name
                        s3_client.delete_object(
                            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                            Key=s3_key
                        )
                        print(f"Deleted file from S3: {s3_key}")
                    except ClientError as e:
                        print(f"Error deleting file from S3: {e}")
                else:
                    # Nếu không sử dụng S3, xóa file từ local storage
                    if hasattr(song.file_path, 'path'):
                        file_path = song.file_path.path
                        if os.path.exists(file_path):
                            os.remove(file_path)
        except Exception as e:
            print(f"Lỗi khi xóa file: {e}")
            # Tiếp tục xóa bài hát ngay cả khi không thể xóa file

        song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
