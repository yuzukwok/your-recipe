from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, UUID4


class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: Optional[int] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None
    main_image_id: Optional[UUID4] = None
    ingredients: Optional[List[Dict[str, Any]]] = None
    steps: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(RecipeBase):
    title: Optional[str] = None


class RecipeInDBBase(RecipeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Recipe(RecipeInDBBase):
    pass


class RecipeWithUser(Recipe):
    user_username: str


class RecipeWithImage(Recipe):
    main_image_url: Optional[str] = None 