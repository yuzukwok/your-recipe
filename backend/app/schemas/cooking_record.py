from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class CookingRecordBase(BaseModel):
    recipe_id: int
    rating: Optional[int] = None
    notes: Optional[str] = None
    images: Optional[List[str]] = None
    actual_time: Optional[int] = None


class CookingRecordCreate(CookingRecordBase):
    pass


class CookingRecordUpdate(BaseModel):
    rating: Optional[int] = None
    notes: Optional[str] = None
    images: Optional[List[str]] = None
    actual_time: Optional[int] = None


class CookingRecordInDBBase(CookingRecordBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class CookingRecord(CookingRecordInDBBase):
    pass


class CookingRecordWithDetails(CookingRecord):
    recipe_title: str
    user_username: str 