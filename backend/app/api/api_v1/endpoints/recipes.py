from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api import deps
from app.services.minio import minio_service  # 导入minio服务

router = APIRouter()


@router.get("/", response_model=List[schemas.RecipeWithImage])
def read_recipes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取菜谱列表
    """
    query = db.query(models.Recipe)
    
    # 按标题搜索
    if title:
        query = query.filter(models.Recipe.title.ilike(f"%{title}%"))
    
    # 按标签过滤
    if tags:
        for tag in tags:
            query = query.filter(models.Recipe.tags.contains([tag]))
    
    recipes = query.offset(skip).limit(limit).all()
    
    # 处理结果，添加图片URL
    result = []
    for recipe in recipes:
        recipe_data = recipe.__dict__.copy()
        if recipe.main_image_id and recipe.main_image:
            try:
                recipe_data["main_image_url"] = minio_service.get_file_url(recipe.main_image.file_path)
            except Exception as e:
                print(f"获取图片URL失败: {str(e)}")
                recipe_data["main_image_url"] = None
        result.append(recipe_data)
    
    return result


@router.get("/popular", response_model=List[schemas.RecipeWithImage])
def read_popular_recipes(
    db: Session = Depends(deps.get_db),
    limit: int = 10,
) -> Any:
    """
    获取热门菜谱（基于烹饪记录数量）
    """
    # 确保limit为正整数
    if limit <= 0:
        limit = 10
    
    # 尝试获取热门菜谱
    try:
        popular_recipes = (
            db.query(models.Recipe)
            .join(models.CookingRecord, models.Recipe.id == models.CookingRecord.recipe_id, isouter=True)
            .group_by(models.Recipe.id)
            .order_by(func.count(models.CookingRecord.id).desc())
            .limit(limit)
            .all()
        )
        
        # 处理结果，添加图片URL
        result = []
        for recipe in popular_recipes:
            recipe_data = recipe.__dict__.copy()
            if recipe.main_image_id and recipe.main_image:
                try:
                    recipe_data["main_image_url"] = minio_service.get_file_url(recipe.main_image.file_path)
                except Exception as e:
                    print(f"获取图片URL失败: {str(e)}")
                    recipe_data["main_image_url"] = None
            result.append(recipe_data)
        
        return result
    except Exception as e:
        # 发生错误时返回空列表
        print(f"获取热门菜谱时出错: {str(e)}")
        return []


@router.post("/", response_model=schemas.Recipe)
def create_recipe(
    *,
    db: Session = Depends(deps.get_db),
    recipe_in: schemas.RecipeCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    创建新菜谱
    """
    recipe = models.Recipe(
        **recipe_in.dict(),
        user_id=current_user.id,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/{id}", response_model=schemas.RecipeWithImage)
def read_recipe(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取指定菜谱
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="菜谱不存在")
    
    # 构造返回对象
    recipe_data = recipe.__dict__.copy()
    
    # 如果有主图片，获取URL
    if recipe.main_image_id and recipe.main_image:
        try:
            recipe_data["main_image_url"] = minio_service.get_file_url(recipe.main_image.file_path)
        except Exception as e:
            print(f"获取图片URL失败: {str(e)}")
            recipe_data["main_image_url"] = None
    
    return recipe_data


@router.put("/{id}", response_model=schemas.Recipe)
def update_recipe(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    recipe_in: schemas.RecipeUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新菜谱
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="菜谱不存在")
    if recipe.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="没有足够的权限")
    
    update_data = recipe_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recipe, field, value)
    
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{id}", response_model=schemas.Recipe)
def delete_recipe(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除菜谱
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="菜谱不存在")
    if recipe.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="没有足够的权限")
    
    db.delete(recipe)
    db.commit()
    return recipe


@router.get("/user/{user_id}", response_model=List[schemas.RecipeWithImage])
def read_user_recipes(
    user_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取指定用户的菜谱
    """
    recipes = db.query(models.Recipe).filter(models.Recipe.user_id == user_id).offset(skip).limit(limit).all()
    
    # 处理结果，添加图片URL
    result = []
    for recipe in recipes:
        recipe_data = recipe.__dict__.copy()
        if recipe.main_image_id and recipe.main_image:
            try:
                recipe_data["main_image_url"] = minio_service.get_file_url(recipe.main_image.file_path)
            except Exception as e:
                print(f"获取图片URL失败: {str(e)}")
                recipe_data["main_image_url"] = None
        result.append(recipe_data)
    
    return result 