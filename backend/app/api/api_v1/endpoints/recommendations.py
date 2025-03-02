import json
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app import models, schemas
from app.api import deps
from app.services.openai_service import openai_service

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_recommendations(
    *,
    db: Session = Depends(deps.get_db),
    limit: int = 5,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取个性化菜谱推荐
    """
    # 获取用户最近浏览的菜谱
    recent_cooking_records = (
        db.query(models.CookingRecord)
        .filter(models.CookingRecord.user_id == current_user.id)
        .order_by(desc(models.CookingRecord.created_at))
        .limit(5)
        .all()
    )
    
    recent_recipe_ids = [record.recipe_id for record in recent_cooking_records]
    
    # 获取这些菜谱的详细信息
    recent_recipes = []
    if recent_recipe_ids:
        recent_recipes = (
            db.query(models.Recipe)
            .filter(models.Recipe.id.in_(recent_recipe_ids))
            .all()
        )
    
    # 提取用户喜好（从菜谱标签中）
    user_preferences = set()
    for recipe in recent_recipes:
        if recipe.tags:
            user_preferences.update(recipe.tags)
    
    # 如果没有足够的数据，返回热门菜谱
    if not user_preferences or len(recent_recipes) < 2:
        popular_recipes = (
            db.query(models.Recipe)
            .join(models.CookingRecord)
            .group_by(models.Recipe.id)
            .order_by(func.count(models.CookingRecord.id).desc())
            .limit(limit)
            .all()
        )
        
        # 如果没有热门菜谱，返回最新菜谱
        if not popular_recipes:
            popular_recipes = (
                db.query(models.Recipe)
                .order_by(desc(models.Recipe.created_at))
                .limit(limit)
                .all()
            )
        
        return [
            {
                "id": recipe.id,
                "title": recipe.title,
                "description": recipe.description,
                "difficulty": recipe.difficulty,
                "cooking_time": recipe.cooking_time,
                "tags": recipe.tags,
                "recommendation_reason": "热门菜谱" if recipe.cooking_records else "新菜谱"
            }
            for recipe in popular_recipes
        ]
    
    # 使用OpenAI获取推荐
    try:
        # 准备数据
        user_pref_list = list(user_preferences)
        recent_recipe_titles = [recipe.title for recipe in recent_recipes]
        
        # 获取推荐
        recommendations = await openai_service.get_recipe_recommendations(
            user_pref_list, recent_recipe_titles
        )
        
        # 解析结果
        if isinstance(recommendations, str):
            recommendations = json.loads(recommendations)
        
        # 返回推荐结果
        return recommendations.get("recipes", [])
    except Exception as e:
        # 如果AI推荐失败，返回基于标签的简单推荐
        tag_based_recipes = (
            db.query(models.Recipe)
            .filter(models.Recipe.tags.overlap(list(user_preferences)))
            .filter(~models.Recipe.id.in_(recent_recipe_ids))  # 排除最近浏览的
            .order_by(desc(models.Recipe.created_at))
            .limit(limit)
            .all()
        )
        
        return [
            {
                "id": recipe.id,
                "title": recipe.title,
                "description": recipe.description,
                "difficulty": recipe.difficulty,
                "cooking_time": recipe.cooking_time,
                "tags": recipe.tags,
                "recommendation_reason": f"基于您喜欢的标签: {', '.join(set(recipe.tags) & user_preferences)}"
            }
            for recipe in tag_based_recipes
        ]


@router.get("/seasonal", response_model=List[schemas.Recipe])
def get_seasonal_recommendations(
    *,
    db: Session = Depends(deps.get_db),
    season: Optional[str] = Query(None, description="季节: spring, summer, autumn, winter"),
    limit: int = 5,
) -> Any:
    """
    获取季节性菜谱推荐
    """
    # 季节标签映射
    season_tags = {
        "spring": ["春季", "春天", "春菜"],
        "summer": ["夏季", "夏天", "清凉"],
        "autumn": ["秋季", "秋天", "秋菜"],
        "winter": ["冬季", "冬天", "暖身"],
    }
    
    query = db.query(models.Recipe)
    
    # 如果指定了季节，按季节过滤
    if season and season in season_tags:
        tags = season_tags[season]
        # 使用任何一个标签都可以匹配
        conditions = [models.Recipe.tags.contains([tag]) for tag in tags]
        if conditions:
            query = query.filter(or_(*conditions))
    
    # 获取菜谱
    try:
        recipes = query.order_by(func.random()).limit(limit).all()
        return recipes
    except Exception as e:
        print(f"获取季节性菜谱时出错: {str(e)}")
        return [] 