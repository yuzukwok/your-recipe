# 家庭菜谱管理系统设计文档

## 1. 系统概述

### 1.1 项目名称
Your Recipe - 智能家庭菜谱管理系统

### 1.2 系统目标
- 提供直观的菜谱管理和分享平台
- 智能分析用户上传的菜品图片
- 记录烹饪过程和心得
- 基于用户喜好进行个性化菜谱推荐
- 支持移动端友好的操作体验

## 2. 技术架构

### 2.1 技术栈
- 前端：Angular 17
  - Angular Material UI 组件库
  - NgRx 状态管理
  - PWA 支持
  - TailwindCSS 样式框架

- 后端：Python
  - FastAPI 框架
  - SQLAlchemy ORM
  - Pydantic 数据验证
  - OpenAI API 集成
  - MinIO SDK

- 数据库：PostgreSQL 16
  - 支持全文搜索
  - JSON 数据类型支持

- 文件存储：MinIO
  - 图片存储和处理
  - 支持分布式部署

### 2.2 系统架构图
```
[用户设备]
    ↓ 
[Angular Frontend + PWA]
    ↓
[FastAPI Backend]
    ↓
┌─────────────┬─────────────┐
│PostgreSQL   │ MinIO       │
└─────────────┴─────────────┘
```

## 3. 数据库设计

### 3.1 主要数据表

```sql
-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 菜谱表
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    cooking_time INTEGER, -- 单位：分钟
    servings INTEGER,
    user_id INTEGER REFERENCES users(id),
    ingredients JSONB,
    steps JSONB,
    tags VARCHAR[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 制作记录表
CREATE TABLE cooking_records (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes TEXT,
    images VARCHAR[], -- 存储MinIO中的图片路径
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 图片表
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    mime_type VARCHAR(50),
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    ai_tags JSONB, -- OpenAI视觉模型分析结果
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. 核心功能模块

### 4.1 用户管理模块
- 用户注册/登录
- 个人信息管理
- 收藏菜谱管理
- 个人制作历史

### 4.2 菜谱管理模块
- 菜谱创建、编辑、删除
- 图片上传与管理
- 标签管理
- 搜索和筛选

### 4.3 制作记录模块
- 记录烹饪过程
- 上传成品图片
- 心得笔记
- 评分系统

### 4.4 AI 智能分析模块
- 图片识别分析
- 食材识别
- 菜品分类
- 营养成分估算

### 4.5 推荐系统模块
- 基于用户喜好的个性化推荐
- 季节性推荐
- 相似菜谱推荐
- 热门菜谱推荐

## 5. API 设计

### 5.1 RESTful API 示例
```
# 用户相关
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/me
PATCH  /api/v1/users/me

# 菜谱相关
GET    /api/v1/recipes
POST   /api/v1/recipes
GET    /api/v1/recipes/{id}
PUT    /api/v1/recipes/{id}
DELETE /api/v1/recipes/{id}

# 制作记录相关
GET    /api/v1/recipes/{id}/records
POST   /api/v1/recipes/{id}/records
GET    /api/v1/records/{id}
PUT    /api/v1/records/{id}

# 图片处理相关
POST   /api/v1/images/upload
POST   /api/v1/images/{id}/analyze
```

## 6. 前端设计

### 6.1 页面布局
- 响应式设计，适配移动端和桌面端
- 底部导航栏（移动端）
- 侧边导航栏（桌面端）
- 卡片式菜谱展示
- 图片预览优化

### 6.2 主要页面
1. 首页
   - 推荐菜谱
   - 最近浏览
   - 季节推荐
   
2. 菜谱详情页
   - 步骤展示
   - 材料清单
   - 制作记录
   - 相关推荐

3. 个人中心
   - 个人信息
   - 我的菜谱
   - 收藏菜谱
   - 制作历史

4. 发布/编辑页
   - 富文本编辑器
   - 图片上传
   - 标签管理
   - 预览功能

## 7. 性能优化

### 7.1 前端优化
- 图片懒加载
- 路由懒加载
- PWA 离线支持
- 本地缓存策略

### 7.2 后端优化
- 数据库索引优化
- 缓存层实现
- 图片处理优化
- API 响应压缩

### 7.3 图片处理优化
- 客户端图片压缩
- 服务端图片处理
- 图片 CDN 加速
- WebP 格式支持

## 8. 安全考虑
- JWT 身份认证
- API 请求限流
- XSS 防护
- CSRF 防护
- 敏感数据加密
- 图片上传验证

## 9. 部署方案
- Docker 容器化部署
- Nginx 反向代理
- HTTPS 证书配置
- 数据备份策略
- 监控告警机制 