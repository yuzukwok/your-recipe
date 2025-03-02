#!/usr/bin/env python
"""
重置数据库表结构，解决recipes表的id列自动递增问题
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

def reset_db_tables():
    """重置数据库表结构"""
    logger.info("开始重置数据库表结构...")
    
    confirm = input("警告：这将删除并重新创建所有表，所有数据将丢失！是否继续？(y/n): ")
    if confirm.lower() != 'y':
        logger.info("操作已取消")
        return
        
    logger.info("确认重置数据库，开始操作...")
    
    try:
        # 删除并重新创建所有表
        Base.metadata.drop_all(engine)
        logger.info("已删除所有表")
        
        Base.metadata.create_all(engine)
        logger.info("已重新创建所有表")
        
        # 验证recipes表的id列是否设置了自动递增
        inspector = inspect(engine)
        
        # 检查recipes表
        if "recipes" in inspector.get_table_names():
            with engine.connect() as conn:
                result = conn.execute(text(
                    "SELECT pg_get_serial_sequence('recipes', 'id') as seq;"
                ))
                row = result.fetchone()
                if row and row[0]:
                    logger.info(f"recipes.id的序列已正确设置: {row[0]}")
                else:
                    logger.error("recipes.id序列未设置！自动递增可能不工作")
                    
                    # 尝试手动设置序列
                    logger.info("尝试手动设置序列...")
                    
                    conn.execute(text("""
                        CREATE SEQUENCE IF NOT EXISTS recipes_id_seq START WITH 1;
                    """))
                    
                    conn.execute(text("""
                        ALTER TABLE recipes ALTER COLUMN id 
                        SET DEFAULT nextval('recipes_id_seq');
                    """))
                    
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
                        
            # 查看表结构
            columns = {col['name']: col for col in inspector.get_columns('recipes')}
            logger.info(f"recipes表的列: {list(columns.keys())}")
            for col_name, col in columns.items():
                logger.info(f"列 {col_name}: {col}")
        else:
            logger.error("recipes表不存在！表创建可能失败")
    
    except Exception as e:
        logger.error(f"重置数据库时出错: {str(e)}")
        
    logger.info("数据库重置操作完成")

if __name__ == "__main__":
    reset_db_tables() 