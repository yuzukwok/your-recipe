#!/usr/bin/env python
import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    # 启动FastAPI应用
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 