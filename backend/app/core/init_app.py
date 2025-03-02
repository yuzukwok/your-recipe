import logging
import json
from minio import Minio
from minio.error import S3Error

from app.core.config import settings

logger = logging.getLogger(__name__)


def init_minio():
    """初始化MinIO存储桶"""
    try:
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        
        # 确保存储桶存在
        if not client.bucket_exists(settings.MINIO_BUCKET_NAME):
            client.make_bucket(settings.MINIO_BUCKET_NAME)
            logger.info(f"创建MinIO存储桶: {settings.MINIO_BUCKET_NAME}")
        else:
            logger.info(f"MinIO存储桶已存在: {settings.MINIO_BUCKET_NAME}")
            
        # 设置存储桶策略，允许公共读取
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{settings.MINIO_BUCKET_NAME}/*"]
                }
            ]
        }
        # 将策略字典转换为JSON字符串
        policy_str = json.dumps(policy)
        client.set_bucket_policy(settings.MINIO_BUCKET_NAME, policy_str)
        logger.info(f"设置MinIO存储桶策略: {settings.MINIO_BUCKET_NAME}")
        
        return True
    except S3Error as e:
        logger.error(f"MinIO初始化错误: {e}")
        return False
    except Exception as e:
        logger.error(f"MinIO初始化过程中发生错误: {e}")
        return False


def init_app():
    """初始化应用"""
    try:
        # 初始化MinIO
        init_minio()
        
        # 可以添加其他初始化操作
        
        logger.info("应用初始化完成")
    except Exception as e:
        logger.error(f"应用初始化失败: {e}")
        logger.warning("应用将以有限功能运行")