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
                from django.db import connection
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
