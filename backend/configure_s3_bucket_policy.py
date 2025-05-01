#!/usr/bin/env python
"""
Script để cấu hình bucket policy cho AWS S3
"""

import json
import boto3
from decouple import config
from botocore.exceptions import ClientError

def configure_s3_bucket_policy():
    """
    Cấu hình bucket policy để cho phép truy cập công khai đến các file trong bucket
    """
    print("=== Cấu hình bucket policy cho AWS S3 ===")
    
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
    
    # Tạo bucket policy
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": [
                    f"arn:aws:s3:::{aws_storage_bucket_name}/*"
                ]
            }
        ]
    }
    
    # Chuyển đổi policy thành chuỗi JSON
    bucket_policy_string = json.dumps(bucket_policy)
    
    try:
        # Áp dụng bucket policy
        s3_client.put_bucket_policy(
            Bucket=aws_storage_bucket_name,
            Policy=bucket_policy_string
        )
        print(f"Đã áp dụng bucket policy thành công!")
        print("\n=== Bucket Policy ===")
        print(json.dumps(bucket_policy, indent=4))
        
        # Cấu hình CORS
        print("\n=== Cấu hình CORS ===")
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'HEAD', 'PUT', 'POST'],
                    'AllowedOrigins': ['*'],
                    'ExposeHeaders': ['ETag', 'Content-Length', 'Content-Type'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }
        
        s3_client.put_bucket_cors(
            Bucket=aws_storage_bucket_name,
            CORSConfiguration=cors_configuration
        )
        print("Đã cấu hình CORS thành công!")
        print(json.dumps(cors_configuration, indent=4))
        
        # Kiểm tra Block Public Access
        print("\n=== Kiểm tra Block Public Access ===")
        response = s3_client.get_public_access_block(Bucket=aws_storage_bucket_name)
        print("Cấu hình Block Public Access hiện tại:")
        print(json.dumps(response['PublicAccessBlockConfiguration'], indent=4))
        
        # Hỏi người dùng có muốn tắt Block Public Access không
        disable_block_public_access = input("\nBạn có muốn tắt Block Public Access không? (y/n): ")
        if disable_block_public_access.lower() == 'y':
            s3_client.put_public_access_block(
                Bucket=aws_storage_bucket_name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': False,
                    'IgnorePublicAcls': False,
                    'BlockPublicPolicy': False,
                    'RestrictPublicBuckets': False
                }
            )
            print("Đã tắt Block Public Access thành công!")
        
    except ClientError as e:
        print(f"\nLỗi khi cấu hình bucket policy: {e}")
    except Exception as e:
        print(f"\nLỗi không xác định: {e}")

if __name__ == "__main__":
    configure_s3_bucket_policy()
