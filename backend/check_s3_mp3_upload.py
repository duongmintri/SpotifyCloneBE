#!/usr/bin/env python
"""
Script để kiểm tra việc tải lên và truy cập file MP3 trên AWS S3
"""

import os
import boto3
from decouple import config
from botocore.exceptions import ClientError
import uuid

def check_s3_mp3_upload():
    """
    Kiểm tra việc tải lên và truy cập file MP3 trên AWS S3
    """
    print("=== Kiểm tra việc tải lên và truy cập file MP3 trên AWS S3 ===")
    
    # Đọc thông tin cấu hình từ file .env
    aws_access_key_id = config('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = config('AWS_SECRET_ACCESS_KEY')
    aws_storage_bucket_name = config('AWS_STORAGE_BUCKET_NAME')
    aws_s3_region_name = config('AWS_S3_REGION_NAME')
    
    # Tạo kết nối với S3
    s3_client = boto3.client(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_s3_region_name
    )
    
    # Tạo một file MP3 tạm (hoặc sử dụng một file MP3 có sẵn)
    test_file_path = input("Nhập đường dẫn đến file MP3 để tải lên (để trống để tạo file tạm): ")
    
    if not test_file_path:
        # Tạo một file tạm
        test_file_path = 'test_upload.txt'
        with open(test_file_path, 'w') as f:
            f.write('Đây là file kiểm tra kết nối với AWS S3')
        print(f"Đã tạo file tạm: {test_file_path}")
    
    # Tạo một tên file ngẫu nhiên để tránh xung đột
    random_filename = f"{str(uuid.uuid4())[:8]}_{os.path.basename(test_file_path)}"
    s3_key = f"media/songs/{random_filename}"
    
    try:
        # Tải lên file
        print(f"\n=== Đang tải lên file '{test_file_path}' với key '{s3_key}' ===")
        s3_client.upload_file(
            test_file_path, 
            aws_storage_bucket_name, 
            s3_key
        )
        print(f"Đã tải lên file thành công!")
        
        # Tạo URL để truy cập file
        s3_url = f"https://{aws_storage_bucket_name}.s3.{aws_s3_region_name}.amazonaws.com/{s3_key}"
        print(f"\n=== URL để truy cập file ===")
        print(s3_url)
        
        # Kiểm tra quyền truy cập công khai
        print(f"\n=== Kiểm tra quyền truy cập công khai ===")
        print(f"Hãy mở URL trên trong trình duyệt để kiểm tra xem bạn có thể truy cập file không.")
        print(f"Nếu bạn nhận được lỗi 'Access Denied', bạn cần cấu hình bucket policy để cho phép truy cập công khai.")
        
        # Hỏi người dùng có muốn xóa file không
        delete_file = input("\nBạn có muốn xóa file trên S3 không? (y/n): ")
        if delete_file.lower() == 'y':
            s3_client.delete_object(
                Bucket=aws_storage_bucket_name,
                Key=s3_key
            )
            print(f"Đã xóa file trên S3 thành công!")
        
    except ClientError as e:
        print(f"\nLỗi khi tải lên hoặc xóa file: {e}")
    except Exception as e:
        print(f"\nLỗi không xác định: {e}")
    
    # Xóa file tạm nếu đã tạo
    if not test_file_path or test_file_path == 'test_upload.txt':
        try:
            os.remove(test_file_path)
            print(f"Đã xóa file tạm: {test_file_path}")
        except:
            pass

if __name__ == "__main__":
    check_s3_mp3_upload()
