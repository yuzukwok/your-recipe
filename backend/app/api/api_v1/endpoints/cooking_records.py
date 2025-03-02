from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.CookingRecord])
def read_cooking_records(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取当前用户的烹饪记录
    """
    cooking_records = (
        db.query(models.CookingRecord)
        .filter(models.CookingRecord.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return cooking_records


@router.post("/", response_model=schemas.CookingRecord)
def create_cooking_record(
    *,
    db: Session = Depends(deps.get_db),
    cooking_record_in: schemas.CookingRecordCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    创建新的烹饪记录
    """
    # 检查菜谱是否存在
    recipe = db.query(models.Recipe).filter(models.Recipe.id == cooking_record_in.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="菜谱不存在")
    
    cooking_record = models.CookingRecord(
        **cooking_record_in.dict(),
        user_id=current_user.id,
    )
    db.add(cooking_record)
    db.commit()
    db.refresh(cooking_record)
    return cooking_record


@router.get("/{id}", response_model=schemas.CookingRecord)
def read_cooking_record(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取指定烹饪记录
    """
    cooking_record = db.query(models.CookingRecord).filter(models.CookingRecord.id == id).first()
    if not cooking_record:
        raise HTTPException(status_code=404, detail="烹饪记录不存在")
    if cooking_record.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="没有足够的权限")
    return cooking_record


@router.put("/{id}", response_model=schemas.CookingRecord)
def update_cooking_record(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    cooking_record_in: schemas.CookingRecordUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新烹饪记录
    """
    cooking_record = db.query(models.CookingRecord).filter(models.CookingRecord.id == id).first()
    if not cooking_record:
        raise HTTPException(status_code=404, detail="烹饪记录不存在")
    if cooking_record.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="没有足够的权限")
    
    update_data = cooking_record_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cooking_record, field, value)
    
    db.add(cooking_record)
    db.commit()
    db.refresh(cooking_record)
    return cooking_record


@router.delete("/{id}", response_model=schemas.CookingRecord)
def delete_cooking_record(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除烹饪记录
    """
    cooking_record = db.query(models.CookingRecord).filter(models.CookingRecord.id == id).first()
    if not cooking_record:
        raise HTTPException(status_code=404, detail="烹饪记录不存在")
    if cooking_record.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="没有足够的权限")
    
    db.delete(cooking_record)
    db.commit()
    return cooking_record


@router.get("/recipe/{recipe_id}", response_model=List[schemas.CookingRecordWithDetails])
def read_recipe_cooking_records(
    *,
    db: Session = Depends(deps.get_db),
    recipe_id: int,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    获取指定菜谱的所有烹饪记录
    """
    # 检查菜谱是否存在
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="菜谱不存在")
    
    # 获取烹饪记录并关联用户信息
    cooking_records_with_details = (
        db.query(
            models.CookingRecord,
            models.Recipe.title.label("recipe_title"),
            models.User.username.label("user_username")
        )
        .join(models.Recipe, models.CookingRecord.recipe_id == models.Recipe.id)
        .join(models.User, models.CookingRecord.user_id == models.User.id)
        .filter(models.CookingRecord.recipe_id == recipe_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # 转换为响应格式
    result = []
    for record, recipe_title, user_username in cooking_records_with_details:
        record_dict = {
            "id": record.id,
            "recipe_id": record.recipe_id,
            "user_id": record.user_id,
            "rating": record.rating,
            "notes": record.notes,
            "images": record.images,
            "actual_time": record.actual_time,
            "created_at": record.created_at,
            "recipe_title": recipe_title,
            "user_username": user_username
        }
        result.append(record_dict)
    
    return result 