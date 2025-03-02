# 数据库初始化脚本
import logging
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

# 初始化数据
def init_db(db: Session) -> None:
    # 创建初始超级用户
    db_user = db.query(models.User).filter(models.User.email == "admin@admin.com").first()
    if not db_user:
        user_in = {
            "username": "admin",
            "email": "admin@admin.com",
            "password_hash": get_password_hash("admin"),
            "is_superuser": True,
        }
        db_user = models.User(**user_in)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info("初始超级用户创建成功")
    else:
        logger.info("超级用户已存在，无需创建") 