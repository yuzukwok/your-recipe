from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

class CookingRecord(Base):
    __tablename__ = "cooking_records"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1-5
    notes = Column(Text)
    images = Column(ARRAY(String))  # 存储MinIO中的图片路径
    actual_time = Column(Integer)  # 实际烹饪时间（分钟）
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    recipe = relationship("Recipe", back_populates="cooking_records")
    user = relationship("User", backref="cooking_records") 