from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

from app.core.config import settings

# 添加调试输出
print(f"数据库连接信息: 服务器={settings.POSTGRES_SERVER}, 用户={settings.POSTGRES_USER}, 数据库={settings.POSTGRES_DB}")
print(f"数据库URI: {settings.SQLALCHEMY_DATABASE_URI}")

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依赖项，用于获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 