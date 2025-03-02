from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# 共享属性
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True


# 创建用户时需要的属性
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str


# 更新用户时可以更新的属性
class UserUpdate(UserBase):
    password: Optional[str] = None


# 数据库中存储的用户属性
class UserInDBBase(UserBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# 返回给API的用户信息
class User(UserInDBBase):
    pass


# 存储在数据库中的用户信息，包含密码
class UserInDB(UserInDBBase):
    password_hash: str 