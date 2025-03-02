#!/usr/bin/env python
"""
重新创建数据库表结构，解决recipes表的id列自动递增问题
不需要交互确认，方便在API中调用
"""
import logging
from sqlalchemy import inspect, text

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 导入数据库相关模块
from app.db.session import engine, Base
from app.models.recipe import Recipe
from app.models.user import User
from app.models.image import Image
from app.models.cooking_record import CookingRecord

def recreate_tables(drop_existing=True):
    """重新创建数据库表结构
    
    Args:
        drop_existing: 是否删除现有表，默认为True
    """
    logger.info("开始重新创建数据库表...")
    
    try:
        if drop_existing:
            # 删除所有表
            Base.metadata.drop_all(engine)
            logger.info("已删除所有表")
        
        # 重新创建所有表
        Base.metadata.create_all(engine)
        logger.info("已创建所有表")
        
        # 验证recipes表的id列是否设置了自动递增
        inspector = inspect(engine)
        
        # 检查recipes表
        if "recipes" in inspector.get_table_names():
            with engine.connect() as conn:
                # 检查序列
                result = conn.execute(text(
                    "SELECT pg_get_serial_sequence('recipes', 'id') as seq;"
                ))
                row = result.fetchone()
                if row and row[0]:
                    logger.info(f"recipes.id的序列已正确设置: {row[0]}")
                else:
                    logger.warning("recipes.id序列未设置，将手动创建...")
                    
                    # 创建序列
                    conn.execute(text("""
                        CREATE SEQUENCE IF NOT EXISTS recipes_id_seq START WITH 1;
                    """))
                    
                    # 关联序列到id列
                    conn.execute(text("""
                        ALTER TABLE recipes ALTER COLUMN id 
                        SET DEFAULT nextval('recipes_id_seq');
                    """))
                    
                    # 设置序列所属关系
                    conn.execute(text("""
                        ALTER SEQUENCE recipes_id_seq OWNED BY recipes.id;
                    """))
                    
                    # 再次检查
                    result = conn.execute(text(
                        "SELECT pg_get_serial_sequence('recipes', 'id') as seq;"
                    ))
                    row = result.fetchone()
                    if row and row[0]:
                        logger.info(f"成功设置recipes.id序列: {row[0]}")
                    else:
                        logger.error("无法设置序列，请手动检查数据库")
                        
            # 输出表结构信息
            columns = {col['name']: col for col in inspector.get_columns('recipes')}
            logger.info(f"recipes表的列: {list(columns.keys())}")
            logger.info(f"id列定义: {columns.get('id')}")
        else:
            logger.error("recipes表不存在！表创建可能失败")
        
        return True
    
    except Exception as e:
        logger.error(f"重新创建表时出错: {str(e)}")
        return False

if __name__ == "__main__":
    success = recreate_tables()
    if success:
        logger.info("数据库表重建成功")
    else:
        logger.error("数据库表重建失败") 