import json
from typing import Any, List, Dict
import io
import httpx
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app import models, schemas
from app.api import deps
from app.services.minio import minio_service
from app.services.openai_service import openai_service

router = APIRouter()


@router.post("/upload", response_model=schemas.ImageUploadResponse)
async def upload_image(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    analyze: bool = Form(False),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    上传图片
    """
    # 验证文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只允许上传图片文件")
    
    # 读取文件内容
    file_content = await file.read()
    
    # 压缩图片
    compressed_image = await openai_service.compress_image(file_content)
    
    # 创建一个临时文件来存储压缩后的图像
    temp_file = io.BytesIO(compressed_image)
    
    # 正确创建UploadFile对象，提供file参数
    file_name = file.filename
    temp_upload_file = UploadFile(file=temp_file, filename=file_name)
    
    # 上传到MinIO
    file_path, unique_filename = await minio_service.upload_file(
        temp_upload_file,
        folder="images"
    )
    
    # 获取图片URL
    file_url = minio_service.get_file_url(file_path)
    
    # 创建图片记录
    image_data = {
        "file_path": file_path,
        "original_filename": file.filename,
        "mime_type": file.content_type,
        "file_size": len(compressed_image),
    }
    
    # 如果需要分析图片
    ai_tags = None
    if analyze:
        try:
            ai_analysis = await openai_service.analyze_image(compressed_image)
            if isinstance(ai_analysis, str):
                ai_tags = json.loads(ai_analysis)
            else:
                ai_tags = ai_analysis
            image_data["ai_tags"] = ai_tags
        except Exception as e:
            # 分析失败不影响上传
            pass
    
    # 保存到数据库
    image = models.Image(**image_data)
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {
        "id": image.id,
        "file_path": file_path,
        "ai_tags": ai_tags
    }


@router.get("/{id}", response_model=schemas.Image)
def read_image(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
) -> Any:
    """
    获取图片信息（无需授权）
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    return image


@router.get("/{id}/url")
def get_image_url(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    expires: int = 3600,
) -> Any:
    """
    获取图片访问URL（无需授权）
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    url = minio_service.get_file_url(image.file_path, expires=expires)
    return {"url": url}


@router.get("/{id}/direct-url")
def get_image_direct_url(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
) -> Any:
    """
    获取图片的直接访问URL（无需授权，无过期时间）
    
    此接口主要用于前端直接展示图片，例如在<img>标签中使用
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    # 获取较长过期时间的URL
    url = minio_service.get_file_url(image.file_path, expires=86400)  # 24小时
    return {"url": url}


@router.delete("/{id}", response_model=schemas.Image)
def delete_image(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除图片
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    # 从MinIO删除
    try:
        minio_service.delete_file(image.file_path)
    except Exception as e:
        # 记录错误但不影响数据库删除
        pass
    
    # 从数据库删除
    db.delete(image)
    db.commit()
    return image


@router.post("/{id}/analyze", response_model=dict)
async def analyze_image(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    分析图片内容
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    # 获取图片内容
    try:
        # 这里需要实现从MinIO获取图片内容的逻辑
        # 简化处理，实际应用中需要从MinIO下载图片
        response = httpx.get(minio_service.get_file_url(image.file_path))
        image_data = response.content
        
        # 分析图片
        analysis_result = await openai_service.analyze_image(image_data)
        
        # 更新数据库
        if isinstance(analysis_result, str):
            image.ai_tags = json.loads(analysis_result)
        else:
            image.ai_tags = analysis_result
        
        db.add(image)
        db.commit()
        db.refresh(image)
        
        return image.ai_tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片分析失败: {str(e)}")


@router.post("/{id}/identify-ingredients", response_model=dict)
async def identify_ingredients(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    识别图片中的食材
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    # 获取图片内容
    try:
        # 从MinIO获取图片内容
        response = httpx.get(minio_service.get_file_url(image.file_path))
        image_data = response.content
        
        # 专门识别图片中的食材
        result = await openai_service.identify_ingredients(image_data)
        
        # 保存识别结果到数据库
        if isinstance(result, str):
            ingredients_data = json.loads(result)
            image.ai_tags = ingredients_data
        else:
            image.ai_tags = result
        
        db.add(image)
        db.commit()
        db.refresh(image)
        
        return image.ai_tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"食材识别失败: {str(e)}")


@router.post("/upload-and-identify", response_model=schemas.ImageUploadResponse)
async def upload_and_identify_ingredients(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    上传图片并直接识别食材
    """
    # 验证文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只允许上传图片文件")
    
    # 读取文件内容
    file_content = await file.read()
    
    # 压缩图片
    compressed_image = await openai_service.compress_image(file_content)
    
    # 创建一个临时文件来存储压缩后的图像
    temp_file = io.BytesIO(compressed_image)
    
    # 正确创建UploadFile对象，提供file参数
    file_name = file.filename
    temp_upload_file = UploadFile(file=temp_file, filename=file_name)
    
    # 上传到MinIO
    file_path, unique_filename = await minio_service.upload_file(
        temp_upload_file,
        folder="images"
    )
    
    # 获取图片URL
    file_url = minio_service.get_file_url(file_path)
    
    # 创建图片记录
    image_data = {
        "file_path": file_path,
        "original_filename": file.filename,
        "mime_type": file.content_type,
        "file_size": len(compressed_image),
    }
    
    # 识别食材
    try:
        ingredients_result = await openai_service.identify_ingredients(compressed_image)
        if isinstance(ingredients_result, str):
            image_data["ai_tags"] = json.loads(ingredients_result)
        else:
            image_data["ai_tags"] = ingredients_result
    except Exception as e:
        # 识别失败不影响上传
        pass
    
    # 保存到数据库
    image = models.Image(**image_data)
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {
        "id": image.id,
        "file_path": file_path,
        "ai_tags": image_data.get("ai_tags")
    }


@router.get("/{id}/download", response_class=StreamingResponse)
async def download_image(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
) -> Any:
    """
    直接下载图片文件，而不是返回URL（无需授权也无需token）
    
    此接口主要用于前端直接展示图片，可在<img>标签的src属性中直接使用
    """
    image = db.query(models.Image).filter(models.Image.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    try:
        # 从MinIO获取预签名URL
        url = minio_service.get_file_url(image.file_path)
        
        # 使用httpx请求图片内容
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # 创建一个内存流
            image_bytes = io.BytesIO(response.content)
            
            # 对文件名进行URL编码，避免中文等非ASCII字符的问题
            safe_filename = urllib.parse.quote(image.original_filename)
            
            # 返回图片数据流，使用UTF-8编码的文件名
            return StreamingResponse(
                image_bytes, 
                media_type=image.mime_type,
                headers={
                    "Content-Disposition": f"inline; filename*=UTF-8''{safe_filename}"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取图片失败: {str(e)}")


@router.post("/batch-urls", response_model=Dict[str, str])
def get_batch_image_urls(
    *,
    db: Session = Depends(deps.get_db),
    image_ids: List[UUID] = Body(..., description="图片ID列表"),
) -> Any:
    """
    批量获取多个图片的URL（无需授权）
    
    传入多个图片ID，返回ID到URL的映射
    """
    result = {}
    
    # 查询所有图片
    images = db.query(models.Image).filter(models.Image.id.in_(image_ids)).all()
    
    # 构建ID到图片的映射
    image_map = {str(image.id): image for image in images}
    
    # 为每个请求的ID生成URL
    for image_id in image_ids:
        str_id = str(image_id)
        if str_id in image_map:
            image = image_map[str_id]
            # 获取URL
            url = minio_service.get_file_url(image.file_path, expires=86400)  # 24小时
            result[str_id] = url
        else:
            # 对于不存在的图片，返回null
            result[str_id] = None
    
    return result 