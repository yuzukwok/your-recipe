import secrets
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings
import os
import pathlib

# 调试输出，查看当前工作目录和.env文件是否存在
current_dir = os.getcwd()
print(f"当前工作目录: {current_dir}")

# 确定.env文件的绝对路径
# 如果当前目录是backend/app，那么.env应该在../../backend/.env
backend_dir = pathlib.Path(current_dir).parent
if backend_dir.name == "app":
    backend_dir = backend_dir.parent
env_file_path = backend_dir / ".env"
print(f".env文件位置: {env_file_path}")
print(f".env文件是否存在: {env_file_path.exists()}")

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:4200"]

    PROJECT_NAME: str = "Your Recipe"

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "yuzu"
    POSTGRES_PASSWORD: str = "yuzu"
    POSTGRES_DB: str = "your_recipe"
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            username=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"{values.get('POSTGRES_DB') or ''}",
        )

    # MinIO配置
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "your-recipe"
    MINIO_SECURE: bool = False

    # OpenAI配置
    OPENAI_API_KEY: str = "None"
    OPENAI_MODEL: str = "gpt-4-vision-preview"
    OPENAI_VISION_MODEL: str = "gpt-4-vision-preview"
    OPENAI_INGREDIENTS_MODEL: str = "qwen2.5-vl-72b-instruct"
    OPENAI_RECOMMENDATION_MODEL: str = "gpt-3.5-turbo"

    class Config:
        case_sensitive = True
        env_file = str(env_file_path)
        print(f"使用.env文件路径: {env_file_path}")


# 调试输出，打印实际的环境变量值
settings = Settings()
