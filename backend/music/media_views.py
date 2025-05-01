from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
import os
from .models import Song
from django.shortcuts import get_object_or_404
from django.db import connection

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def serve_s3_file(request, file_path):
    """
    Phục vụ file từ S3 thông qua API endpoint
    """
    # Tạo URL trực tiếp đến file trên S3
    s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_path}"

    # Log thông tin để debug
    print(f"Serving S3 file: {s3_url}")

    # Trả về URL trong response JSON
    return Response({"url": s3_url}, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def serve_song_file(request, song_id):
    """
    Phục vụ file nhạc dựa trên ID của bài hát
    """
    try:
        # Lấy bài hát từ database
        song = get_object_or_404(Song, id=song_id)

        if settings.USE_S3:
            # Lấy đường dẫn file từ database
            file_path_name = song.file_path.name

            # Tạo URL trực tiếp đến file trên S3
            file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_path_name}"

            # Kiểm tra xem URL có chứa đường dẫn đầy đủ không
            if not file_url.endswith('.mp3'):
                # Truy vấn database để lấy đường dẫn đầy đủ
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT file_path FROM songs WHERE id = %s",
                        [song.id]
                    )
                    result = cursor.fetchone()
                    if result:
                        file_path_db = result[0]
                        file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_path_db}"

            # Log thông tin để debug
            print(f"Song ID: {song.id}")
            print(f"Song title: {song.title}")
            print(f"File path name: {file_path_name}")
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

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def serve_song_video(request, song_id):
    """
    Phục vụ file video của bài hát dựa trên ID của bài hát
    """
    try:
        # Lấy bài hát từ database
        song = get_object_or_404(Song, id=song_id)

        # Kiểm tra xem bài hát có video không
        if not song.video:
            return Response({"detail": "Bài hát này không có video"}, status=status.HTTP_404_NOT_FOUND)

        if settings.USE_S3:
            # Lấy đường dẫn file video từ database
            video_path_name = song.video.name

            # Tạo URL trực tiếp đến file trên S3
            video_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{video_path_name}"

            # Kiểm tra xem URL có chứa đường dẫn đầy đủ không
            if not (video_url.endswith('.mp4') or video_url.endswith('.webm')):
                # Truy vấn database để lấy đường dẫn đầy đủ
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT video FROM songs WHERE id = %s",
                        [song.id]
                    )
                    result = cursor.fetchone()
                    if result and result[0]:
                        video_path_db = result[0]
                        video_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{video_path_db}"

            # Log thông tin để debug
            print(f"Song ID: {song.id}")
            print(f"Song title: {song.title}")
            print(f"Video path name: {video_path_name}")
            print(f"Serving song video from S3: {video_url}")

            # Trả về URL trong response JSON
            return Response({"url": video_url}, status=status.HTTP_200_OK)
        else:
            # Nếu không sử dụng S3, phục vụ file từ local storage
            video_path = song.video.path
            if not os.path.exists(video_path):
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)

            from django.http import FileResponse
            return FileResponse(
                open(video_path, 'rb'),
                content_type='video/mp4',
                as_attachment=False,
                filename=f"{song.title}.mp4"
            )
    except Exception as e:
        print(f"Error serving song video: {str(e)}")
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
