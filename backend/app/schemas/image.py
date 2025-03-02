from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, UUID4


class ImageBase(BaseModel):
    file_path: str
    original_filename: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    ai_tags: Optional[Dict[str, Any]] = None


class ImageCreate(ImageBase):
    pass


class ImageUpdate(ImageBase):
    file_path: Optional[str] = None


class ImageInDBBase(ImageBase):
    id: UUID4
    created_at: datetime

    class Config:
        orm_mode = True


class Image(ImageInDBBase):
    pass


class ImageUploadResponse(BaseModel):
    id: UUID4
    file_path: str
    ai_tags: Optional[Dict[str, Any]] = None 