from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    file_path = Column(String(255), nullable=False)
    original_filename = Column(String(255))
    mime_type = Column(String(50))
    file_size = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    ai_tags = Column(JSONB)  # OpenAI视觉模型分析结果
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 