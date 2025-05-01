#!/usr/bin/env python
"""
Script để kiểm tra kết nối với AWS S3
"""

import os
import boto3
from decouple import config
from botocore.exceptions import ClientError

def check_s3_connection():
    """
    Kiểm tra kết nối với AWS S3 và liệt kê các bucket và đối tượng
    """
    print("=== Kiểm tra kết nối với AWS S3 ===")
    
    # Đọc thông tin cấu hình từ file .env
    aws_access_key_id = config('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = config('AWS_SECRET_ACCESS_KEY')
    aws_storage_bucket_name = config('AWS_STORAGE_BUCKET_NAME')
    aws_s3_region_name = config('AWS_S3_REGION_NAME')
    
    print(f"AWS Access Key ID: {aws_access_key_id[:5]}...{aws_access_key_id[-3:]}")
    print(f"AWS Secret Access Key: {aws_secret_access_key[:3]}...{aws_secret_access_key[-3:]}")
    print(f"AWS Storage Bucket Name: {aws_storage_bucket_name}")
    print(f"AWS S3 Region Name: {aws_s3_region_name}")
    
    try:
        # Tạo kết nối với S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_s3_region_name
        )
        
        print("\n=== Danh sách các bucket ===")
        response = s3_client.list_buckets()
        for bucket in response['Buckets']:
            print(f"- {bucket['Name']}")
        
        # Kiểm tra xem bucket của bạn có trong danh sách không
        bucket_exists = any(bucket['Name'] == aws_storage_bucket_name for bucket in response['Buckets'])
        if bucket_exists:
            print(f"\nBucket '{aws_storage_bucket_name}' tồn tại!")
            
            # Liệt kê các đối tượng trong bucket
            print(f"\n=== Danh sách các đối tượng trong bucket '{aws_storage_bucket_name}' ===")
            try:
                response = s3_client.list_objects_v2(Bucket=aws_storage_bucket_name)
                if 'Contents' in response:
                    for obj in response['Contents']:
                        print(f"- {obj['Key']} ({obj['Size']} bytes)")
                else:
                    print("Bucket trống hoặc không có quyền liệt kê đối tượng.")
            except ClientError as e:
                print(f"Lỗi khi liệt kê đối tượng: {e}")
            
            # Thử tải lên một file nhỏ
            print("\n=== Thử tải lên một file nhỏ ===")
            try:
                # Tạo một file tạm
                test_file_path = 'test_upload.txt'
                with open(test_file_path, 'w') as f:
                    f.write('Đây là file kiểm tra kết nối với AWS S3')
                
                # Tải lên file
                s3_client.upload_file(
                    test_file_path, 
                    aws_storage_bucket_name, 
                    'test_upload.txt'
                )
                print(f"Đã tải lên file thành công!")
                
                # Xóa file tạm
                os.remove(test_file_path)
                
                # Xóa file trên S3
                s3_client.delete_object(
                    Bucket=aws_storage_bucket_name,
                    Key='test_upload.txt'
                )
                print(f"Đã xóa file trên S3 thành công!")
            except ClientError as e:
                print(f"Lỗi khi tải lên hoặc xóa file: {e}")
        else:
            print(f"\nBucket '{aws_storage_bucket_name}' không tồn tại hoặc bạn không có quyền truy cập!")
    
    except ClientError as e:
        print(f"\nLỗi khi kết nối với AWS S3: {e}")
    except Exception as e:
        print(f"\nLỗi không xác định: {e}")

if __name__ == "__main__":
    check_s3_connection()
