from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    difficulty = Column(Integer)  # 1-5
    cooking_time = Column(Integer)  # 单位：分钟
    servings = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    main_image_id = Column(UUID(as_uuid=True), ForeignKey("images.id"), nullable=True)
    ingredients = Column(JSONB)  # 存储食材列表
    steps = Column(JSONB)  # 存储步骤列表
    tags = Column(ARRAY(String))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", backref="recipes")
    main_image = relationship("Image", foreign_keys=[main_image_id])
    cooking_records = relationship("CookingRecord", back_populates="recipe", cascade="all, delete-orphan") 