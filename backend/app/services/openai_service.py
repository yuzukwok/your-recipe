import base64
import json
import logging
from typing import Dict, Any, List, Optional

import httpx
from openai import OpenAI
from PIL import Image
import io

from app.core.config import settings

# 配置日志
logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        # 配置OpenAI客户端，添加baseURL支持
        api_config = {
            "api_key": settings.OPENAI_API_KEY,
            "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1"
        }
        
        
        
        # 初始化OpenAI客户端
        self.client = OpenAI(**api_config)
        
        # 设置不同任务使用的模型
        self.default_model = settings.OPENAI_MODEL
        self.vision_model = getattr(settings, 'OPENAI_VISION_MODEL', self.default_model)
        self.ingredients_model = getattr(settings, 'OPENAI_INGREDIENTS_MODEL', self.vision_model)
        self.recommendation_model = getattr(settings, 'OPENAI_RECOMMENDATION_MODEL', "gpt-3.5-turbo")
        
        # 记录使用的模型信息
        logger.info(f"OpenAI服务初始化完成。默认模型: {self.default_model}")
        logger.info(f"视觉模型: {self.vision_model}")
        logger.info(f"食材识别模型: {self.ingredients_model}")
        logger.info(f"推荐模型: {self.recommendation_model}")

    async def analyze_image(self, image_data: bytes) -> Dict[str, Any]:
        """
        使用OpenAI视觉模型分析图片
        
        Args:
            image_data: 图片二进制数据
            
        Returns:
            Dict[str, Any]: 分析结果
        """
        try:
            # 将图片转换为base64
            base64_image = base64.b64encode(image_data).decode('utf-8')
            
            logger.info(f"正在使用模型 {self.vision_model} 分析图片")
            
            logger.info(self.client.base_url)
            logger.info(self.client.api_key)
            # 调用OpenAI API
            response = self.client.chat.completions.create(
                model=self.vision_model,  # 使用视觉模型
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一个专业的菜品分析助手，请分析这张菜品图片，识别菜品名称、主要食材、估计的烹饪方法和营养成分。"
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "请分析这张菜品图片，提供以下信息：\n1. 菜品名称\n2. 主要食材\n3. 估计的烹饪方法\n4. 估计的营养成分\n请以JSON格式返回结果。"},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"}
            )
            
            # 解析结果
            result = response.choices[0].message.content
            logger.info("图片分析成功完成")
            
            # 确保返回的是字典
            if isinstance(result, str):
                try:
                    result = json.loads(result)
                except json.JSONDecodeError:
                    logger.error("返回的JSON无法解析")
                    return {"error": "无法解析JSON响应", "message": "图片分析失败"}
            
            return result
        except Exception as e:
            logger.error(f"图片分析失败: {str(e)}")
            return {"error": str(e), "message": "图片分析失败"}

    async def identify_ingredients(self, image_data: bytes) -> Dict[str, Any]:
        """
        专门识别图片中的食材
        
        Args:
            image_data: 图片二进制数据
            
        Returns:
            Dict[str, Any]: 食材识别结果
        """
        try:
            # 将图片转换为base64
            base64_image = base64.b64encode(image_data).decode('utf-8')
            
            logger.info(f"正在使用模型 {self.ingredients_model} 识别食材")
            
            logger.info(self.client.base_url)
            logger.info(self.client.api_key)
            
            # 调用OpenAI API，专注于食材识别
            response = self.client.chat.completions.create(
                model=self.ingredients_model,  # 使用专门的食材识别模型
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一个专业的食材识别助手，你的任务是识别图片中所有可见的食材。请尽可能详细地列出所有食材，不要漏掉任何一种。"
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "请识别这张图片中的所有食材，并以JSON格式返回。格式要求：\n{\n  \"ingredients\": [\"食材1\", \"食材2\", ...]\n}"},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"}
            )
            
            # 解析结果
            result = response.choices[0].message.content
            logger.info("食材识别成功完成")
            
            # 确保返回的是字典
            if isinstance(result, str):
                try:
                    result = json.loads(result)
                except json.JSONDecodeError:
                    logger.error("返回的JSON无法解析")
                    return {"error": "无法解析JSON响应", "message": "食材识别失败", "ingredients": []}
            
            # 确保ingredients字段存在
            if "ingredients" not in result:
                result["ingredients"] = []
            
            return result
        except Exception as e:
            logger.error(f"食材识别失败: {str(e)}")
            return {"error": str(e), "message": "食材识别失败", "ingredients": []}

    async def get_recipe_recommendations(self, user_preferences: List[str], recent_recipes: List[str]) -> Dict[str, Any]:
        """
        基于用户喜好和最近的菜谱获取推荐
        
        Args:
            user_preferences: 用户喜好标签列表
            recent_recipes: 最近浏览/制作的菜谱列表
            
        Returns:
            Dict[str, Any]: 推荐菜谱结果
        """
        try:
            # 构建提示
            prompt = f"""
            基于以下用户喜好和最近浏览的菜谱，推荐5道新菜谱：
            
            用户喜好标签: {', '.join(user_preferences)}
            最近浏览/制作的菜谱: {', '.join(recent_recipes)}
            
            请以JSON格式返回结果，结构如下：
            {{
                "recipes": [
                    {{
                        "name": "菜谱名称",
                        "description": "简短描述",
                        "difficulty": 难度（1-5）,
                        "cooking_time": 烹饪时间（分钟）,
                        "main_ingredients": ["主要食材1", "主要食材2", ...]
                    }},
                    ...
                ]
            }}
            """
            
            logger.info(f"正在使用模型 {self.recommendation_model} 获取菜谱推荐")
            
            # 调用OpenAI API
            response = self.client.chat.completions.create(
                model=self.recommendation_model,  # 使用推荐模型
                messages=[
                    {"role": "system", "content": "你是一个专业的菜谱推荐助手，根据用户喜好和历史记录推荐合适的菜谱。"},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # 解析结果
            result = response.choices[0].message.content
            logger.info("菜谱推荐成功完成")
            
            # 确保返回的是字典
            if isinstance(result, str):
                try:
                    result = json.loads(result)
                except json.JSONDecodeError:
                    logger.error("返回的JSON无法解析")
                    return {"error": "无法解析JSON响应", "message": "获取推荐失败", "recipes": []}
            
            # 确保recipes字段存在
            if "recipes" not in result:
                result["recipes"] = []
            
            return result
        except Exception as e:
            logger.error(f"获取菜谱推荐失败: {str(e)}")
            return {"error": str(e), "message": "获取推荐失败", "recipes": []}

    async def compress_image(self, image_data: bytes, max_size: int = 1024, quality: int = 85) -> bytes:
        """
        压缩图片
        
        Args:
            image_data: 图片二进制数据
            max_size: 最大尺寸（像素）
            quality: JPEG质量（1-100）
            
        Returns:
            bytes: 压缩后的图片数据
        """
        try:
            # 打开图片
            img = Image.open(io.BytesIO(image_data))
            
            # 调整尺寸
            width, height = img.size
            if width > max_size or height > max_size:
                if width > height:
                    new_width = max_size
                    new_height = int(height * max_size / width)
                else:
                    new_height = max_size
                    new_width = int(width * max_size / height)
                img = img.resize((new_width, new_height), Image.LANCZOS)
            
            # 保存为JPEG
            output = io.BytesIO()
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=quality, optimize=True)
            
            compressed_data = output.getvalue()
            logger.info(f"图片压缩成功: 原始大小 {len(image_data)} 字节，压缩后 {len(compressed_data)} 字节")
            return compressed_data
        except Exception as e:
            logger.error(f"图片压缩失败: {str(e)}")
            # 如果压缩失败，返回原图
            return image_data


# 创建单例实例
openai_service = OpenAIService() 