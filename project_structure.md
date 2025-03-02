# Your Recipe 项目结构说明

本文档提供了 Your Recipe 项目的结构概览和各组件功能说明。

## 项目总体结构

```
your-recipe/
├── backend/            # 后端代码
├── frontend/           # 前端代码
├── docker-compose.yml  # Docker 部署配置
├── README.md           # 项目说明文档
├── design_document.md  # 系统设计文档 
└── .gitignore          # Git 忽略配置
```

## 后端结构 (`backend/`)

```
backend/
├── app/                # 应用主目录
│   ├── api/            # API 路由定义
│   │   ├── endpoints/  # 各功能模块的API端点
│   │   └── deps.py     # 依赖注入函数
│   ├── core/           # 核心配置
│   │   ├── config.py   # 应用配置
│   │   └── security.py # 安全相关工具
│   ├── db/             # 数据库
│   │   └── session.py  # 数据库会话
│   ├── models/         # SQLAlchemy 模型
│   │   ├── user.py     # 用户模型
│   │   ├── recipe.py   # 菜谱模型
│   │   └── record.py   # 制作记录模型
│   ├── schemas/        # Pydantic 数据验证模型
│   │   ├── user.py     # 用户模式
│   │   ├── recipe.py   # 菜谱模式
│   │   └── record.py   # 制作记录模式
│   ├── services/       # 业务逻辑服务
│   │   ├── ai.py       # AI 服务集成
│   │   ├── storage.py  # 文件存储服务
│   │   └── recipes.py  # 菜谱相关业务逻辑
│   ├── utils/          # 工具函数
│   │   ├── images.py   # 图片处理
│   │   └── token.py    # 令牌处理
│   └── main.py         # 应用入口点
├── alembic/            # 数据库迁移
│   ├── versions/       # 迁移版本
│   └── env.py          # 迁移环境配置
├── alembic.ini         # Alembic 配置
├── .env                # 环境变量（本地开发）
├── .env.example        # 环境变量示例
├── init_data.py        # 初始化数据脚本
├── requirements.txt    # Python 依赖
├── run.py              # 运行脚本
└── Dockerfile          # Docker 构建配置
```

### 主要组件功能说明

- **app/api/**: 包含所有API路由和端点定义，按功能模块组织
- **app/core/**: 核心配置和安全设置
- **app/models/**: 数据库模型定义，使用SQLAlchemy ORM
- **app/schemas/**: 请求和响应模型定义，使用Pydantic
- **app/services/**: 业务逻辑服务，包括AI分析和文件存储
- **app/utils/**: 辅助功能和工具函数
- **alembic/**: 数据库迁移配置和版本管理

## 前端结构 (`frontend/`)

```
frontend/
├── src/                   # 源代码
│   ├── app/               # Angular 应用
│   │   ├── components/    # 共享组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # 服务
│   │   ├── models/        # 数据模型接口
│   │   ├── store/         # NgRx 状态管理
│   │   │   ├── actions/   # 状态动作
│   │   │   ├── reducers/  # 状态归约器
│   │   │   ├── effects/   # 副作用处理
│   │   │   └── selectors/ # 状态选择器
│   │   ├── guards/        # 路由守卫
│   │   └── app.module.ts  # 应用模块
│   ├── environments/      # 环境配置
│   ├── styles.scss        # 全局样式
│   ├── index.html         # HTML 模板
│   ├── manifest.webmanifest # PWA 配置
│   └── main.ts            # 应用入口点
├── angular.json           # Angular 配置
├── tailwind.config.js     # Tailwind CSS 配置
├── tsconfig.json          # TypeScript 配置
├── package.json           # NPM 依赖和脚本
├── proxy.conf.json        # 开发代理配置
├── ngsw-config.json       # Service Worker 配置
├── Dockerfile             # Docker 构建配置
└── nginx.conf             # Nginx 配置（生产环境）
```

### 主要组件功能说明

- **src/app/components/**: 可复用组件，如表单、卡片等
- **src/app/pages/**: 应用的主要页面，如首页、菜谱详情页等
- **src/app/services/**: 服务层，负责API通信和业务逻辑
- **src/app/store/**: NgRx状态管理，包含actions、reducers、effects和selectors
- **src/app/models/**: TypeScript接口定义，用于类型检查
- **src/app/guards/**: 路由守卫，用于权限控制

## Docker 部署结构

Docker Compose 配置定义了四个主要服务：

1. **backend**: FastAPI后端服务
   - 端口: 8000
   - 依赖: postgres, minio

2. **frontend**: Angular前端服务
   - 端口: 4200 (开发) / 80 (生产)
   - 依赖: backend

3. **postgres**: PostgreSQL数据库
   - 端口: 5432
   - 持久化: postgres-data 卷

4. **minio**: MinIO对象存储
   - 端口: 9000 (API) / 9001 (控制台)
   - 持久化: minio-data 卷

所有服务都连接到名为"app-network"的Docker网络。 