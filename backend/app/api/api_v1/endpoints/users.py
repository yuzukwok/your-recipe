from typing import Any, List
from datetime import timedelta

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.config import settings

router = APIRouter()


@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    创建新用户
    """
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="该邮箱已被注册",
        )
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="该用户名已被使用",
        )
    user = models.User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),  # 使用哈希处理密码
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/open", response_model=schemas.User)
def create_user_open(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    开放注册接口，无需认证
    """
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
    user = models.User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),  # 使用哈希处理密码
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 兼容的token登录，获取访问令牌
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):  # 验证哈希密码
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.User)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    获取当前用户信息
    """
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    user_in: schemas.UserUpdate,
) -> Any:
    """
    更新当前用户信息
    """
    if user_in.username is not None:
        current_user.username = user_in.username
    if user_in.email is not None:
        current_user.email = user_in.email
    if user_in.password is not None:
        current_user.password_hash = get_password_hash(user_in.password)  # 使用哈希处理密码
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user 