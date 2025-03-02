#!/usr/bin/env python
import logging

from app.db.init_db import init_db
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    db = SessionLocal()
    init_db(db)


def main() -> None:
    logger.info("创建初始数据")
    init()
    logger.info("初始数据创建完成")


if __name__ == "__main__":
    main() 