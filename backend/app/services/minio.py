import os
import uuid
import logging
from typing import Optional, Tuple, List
from datetime import datetime, timedelta
import io
import urllib.parse

from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

class MinioService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        
        # 确保存储桶存在
        self.ensure_bucket_exists(settings.MINIO_BUCKET_NAME)
    
    def ensure_bucket_exists(self, bucket_name: str) -> None:
        """
        确保指定的桶存在，如果不存在则创建
        """
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)
                logger.info(f"Bucket '{bucket_name}' 已创建")
            else:
                logger.info(f"Bucket '{bucket_name}' 已存在")
        except S3Error as e:
            logger.error(f"MinIO错误: {e}")
            raise
    
    async def upload_file(
        self, file: UploadFile, folder: str = ""
    ) -> Tuple[str, str]:
        """
        上传文件到MinIO，并按日期组织文件结构
        返回: (文件路径, 唯一文件名)
        """
        try:
            # 生成唯一文件名
            _, ext = os.path.splitext(file.filename)
            unique_filename = f"{uuid.uuid4()}{ext}"
            
            # 按日期组织文件夹结构: folder/YYYY/MM/DD/
            today = datetime.now()
            date_path = today.strftime("%Y/%m/%d")
            
            # 构建文件路径
            if folder:
                file_path = f"{folder}/{date_path}/{unique_filename}"
            else:
                file_path = f"{date_path}/{unique_filename}"
            
            # 读取文件内容
            file_content = await file.read()
            file_size = len(file_content)
            
            # 重置文件指针
            file.file.seek(0)
            
            # 将文件内容转换为内存文件对象
            file_data = io.BytesIO(file_content)
            
            # 上传到MinIO
            self.client.put_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=file_path,
                data=file_data,
                length=file_size,
                content_type=file.content_type,
            )
            
            return file_path, unique_filename
        except S3Error as e:
            logger.error(f"上传文件到MinIO时出错: {e}")
            raise Exception(f"上传文件时出错: {e}")
        finally:
            # 确保关闭文件
            await file.close()
    
    def get_file_url(self, file_path: str, expires: int = 3600) -> str:
        """
        获取文件的临时访问URL
        
        Args:
            file_path: 文件路径
            expires: URL过期时间（秒），默认1小时
        """
        try:
            # 将整数秒转换为timedelta对象
            expires_delta = timedelta(seconds=expires)
            
            # 对文件路径进行URL编码处理，确保包含中文或特殊字符的路径可以正确处理
            # 注意：path中的斜杠/不应该被编码，所以先拆分路径，分别编码后再组合
            path_parts = file_path.split('/')
            encoded_parts = [urllib.parse.quote(part) for part in path_parts]
            encoded_file_path = '/'.join(encoded_parts)
            
            # 获取预签名URL
            url = self.client.presigned_get_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=file_path,  # 这里使用原始路径，MinIO客户端会处理编码
                expires=expires_delta
            )
            return url
        except S3Error as e:
            logger.error(f"获取文件URL时出错: {e}")
            raise Exception(f"获取文件URL时出错: {e}")
    
    def delete_file(self, file_path: str) -> bool:
        """
        从MinIO删除文件
        """
        try:
            self.client.remove_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=file_path
            )
            return True
        except S3Error as e:
            logger.error(f"删除文件时出错: {e}")
            return False
    
    def list_files(self, prefix: str = "", recursive: bool = True) -> List[str]:
        """
        列出指定前缀下的所有文件
        """
        try:
            objects = self.client.list_objects(
                bucket_name=settings.MINIO_BUCKET_NAME,
                prefix=prefix,
                recursive=recursive
            )
            return [obj.object_name for obj in objects]
        except S3Error as e:
            logger.error(f"列出文件时出错: {e}")
            raise Exception(f"列出文件时出错: {e}")

# 创建单例实例
minio_service = MinioService() 