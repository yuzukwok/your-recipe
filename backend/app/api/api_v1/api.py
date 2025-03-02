from fastapi import APIRouter

from app.api.api_v1.endpoints import users, recipes, images, cooking_records, auth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(cooking_records.router, prefix="/cooking-records", tags=["cooking-records"])
 