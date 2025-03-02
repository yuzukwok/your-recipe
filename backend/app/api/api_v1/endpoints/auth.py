from typing import Any
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.security import create_access_token, verify_password
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(deps.get_db), 
    credentials: dict = Body(...)
) -> Any:
    """
    前端登录接口，获取访问令牌
    """
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="用户名和密码不能为空")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=schemas.User)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    注册新用户
    """
    # 调用已有的用户创建接口
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=409,
            detail="该邮箱已被注册",
        )
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=409,
            detail="该用户名已被使用",
        )
    
    # 复用users.py中的用户创建逻辑
    from app.core.security import get_password_hash
    user = models.User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user 