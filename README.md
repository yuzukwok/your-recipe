# Your Recipe - 智能家庭菜谱管理系统

一个现代化的家庭菜谱管理系统，帮助用户管理菜谱、记录烹饪过程，并提供智能推荐功能。

## 功能特点

- 菜谱管理：创建、编辑、删除和分享菜谱
- 制作记录：记录烹饪过程、上传成品图片、添加心得笔记
- AI 图像分析：使用 OpenAI 视觉模型分析上传的菜品图片
- 个性化推荐：基于用户喜好和历史记录推荐菜谱
- 响应式设计：适配移动端和桌面端

## 技术栈

### 后端
- Python + FastAPI
- PostgreSQL 数据库
- SQLAlchemy ORM
- MinIO 文件存储
- OpenAI API 集成
- Alembic 数据库迁移

### 前端
- Angular 17
- Angular Material UI
- NgRx 状态管理
- TailwindCSS
- PWA 支持

## 项目结构

```
├── backend/              # 后端代码
│   ├── app/              # 应用代码
│   │   ├── api/          # API路由
│   │   ├── core/         # 核心配置
│   │   ├── db/           # 数据库连接
│   │   ├── models/       # 数据库模型
│   │   ├── schemas/      # Pydantic模型
│   │   ├── services/     # 业务逻辑
│   │   └── utils/        # 工具函数
│   ├── alembic/          # 数据库迁移
│   └── requirements.txt  # 依赖列表
├── frontend/             # 前端代码
│   ├── src/              # 源代码
│   │   ├── app/          # Angular应用
│   │   └── environments/ # 环境配置
│   └── package.json      # 依赖管理
└── docker-compose.yml    # Docker配置
```

## 开发环境设置

### 后端设置

1. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

2. 设置环境变量
创建 `.env` 文件在 backend 目录下，并添加以下内容：
```
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=your_recipe
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=your-recipe
OPENAI_API_KEY=your_openai_api_key
# 可选：自定义OpenAI API的基础URL，如果使用代理或自定义模型服务
OPENAI_BASE_URL=
# 可选：自定义不同任务使用的模型
OPENAI_MODEL=gpt-4-vision-preview
OPENAI_VISION_MODEL=gpt-4-vision-preview
OPENAI_INGREDIENTS_MODEL=gpt-4-vision-preview
OPENAI_RECOMMENDATION_MODEL=gpt-3.5-turbo
```

注意：项目中已包含 `.env.example` 文件，可作为配置参考。

3. 创建数据库
```bash
# 使用 PostgreSQL 客户端创建数据库
createdb your_recipe
```

4. 运行数据库迁移
```bash
cd backend
alembic upgrade head
```

5. 启动后端服务
```bash
cd backend
uvicorn app.main:app --reload
# 或使用
python run.py
```

### 前端设置

1. 安装依赖
```bash
cd frontend
npm install
```

2. 启动开发服务器
```bash
cd frontend
ng serve
# 或使用
npm run start:local
```

## 部署

### 使用 Docker 部署

1. 构建 Docker 镜像
```bash
docker-compose build
```

2. 启动服务
```bash
docker-compose up -d
```

服务端口：
- 前端：http://localhost:4200
- 后端API：http://localhost:8000
- MinIO控制台：http://localhost:9001
- PostgreSQL：localhost:5432

## 贡献

欢迎贡献代码、报告问题或提出新功能建议。

## 许可证

MIT 