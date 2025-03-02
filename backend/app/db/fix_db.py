#!/usr/bin/env python
"""
修复数据库表结构，特别是recipes表的id列自动递增问题
"""
import logging
import sys
from sqlalchemy import inspect, text

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 导入数据库相关模块
from app.db.session import engine, Base
from app.models.recipe import Recipe
from app.models.user import User
from app.models.image import Image

def check_and_fix_tables():
    """检查并修复数据库表结构"""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    logger.info(f"数据库中的表: {tables}")
    
    # 检查recipes表
    if "recipes" in tables:
        columns = {col['name']: col for col in inspector.get_columns('recipes')}
        logger.info(f"recipes表的列: {list(columns.keys())}")
        
        # 检查id列的自动递增设置
        if 'id' in columns:
            # PostgreSQL中，序列通常是单独的对象，需要检查序列是否存在
            with engine.connect() as conn:
                result = conn.execute(text(
                    "SELECT pg_get_serial_sequence('recipes', 'id') as seq;"
                ))
                row = result.fetchone()
                if row and row[0]:
                    logger.info(f"recipes.id的序列已存在: {row[0]}，自动递增正常")
                else:
                    logger.warning("recipes.id没有关联序列，需要修复自动递增设置")
                    
                    try:
                        # 获取当前ID的最大值
                        result = conn.execute(text("SELECT COALESCE(MAX(id), 0) FROM recipes;"))
                        max_id = result.scalar()
                        logger.info(f"当前recipes表中最大ID: {max_id}")
                        
                        # 创建序列并设置开始值
                        conn.execute(text(f"""
                            CREATE SEQUENCE IF NOT EXISTS recipes_id_seq 
                            START WITH {max_id + 1};
                        """))
                        
                        # 将序列与列关联
                        conn.execute(text("""
                            ALTER TABLE recipes ALTER COLUMN id 
                            SET DEFAULT nextval('recipes_id_seq');
                        """))
                        conn.execute(text("""
                            ALTER SEQUENCE recipes_id_seq OWNED BY recipes.id;
                        """))
                        
                        # 确认修复成功
                        result = conn.execute(text(
                            "SELECT pg_get_serial_sequence('recipes', 'id') as seq;"
                        ))
                        row = result.fetchone()
                        if row and row[0]:
                            logger.info(f"修复成功！recipes.id现在使用序列: {row[0]}")
                        else:
                            logger.error("修复失败，recipes.id仍然没有关联序列")
                            
                    except Exception as e:
                        logger.error(f"修复过程中发生错误: {str(e)}")
        else:
            logger.error("recipes表中不存在id列！")
    else:
        logger.warning("recipes表不存在")
        logger.info("将创建所有表...")
        Base.metadata.create_all(engine)
        logger.info("表创建完成")

if __name__ == "__main__":
    logger.info("开始检查和修复数据库表结构...")
    check_and_fix_tables()
    logger.info("数据库检查和修复完成") 