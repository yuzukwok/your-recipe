# Your Recipe 数据库字典

本文档详细描述了 Your Recipe 系统的数据库结构，包括各个表的字段定义、数据类型、约束和关系。

## 数据库表概览

系统包含以下四个主要表：

1. **users** - 用户信息表
2. **recipes** - 菜谱信息表
3. **cooking_records** - 烹饪记录表
4. **images** - 图片资源表

以下是数据库关系图：

```
users ─────┐
     │     │
     │     │
     ▼     │
recipes ◄──┘
     │
     │
     ▼
cooking_records
     
images ◄── recipes
```

## 表结构详细说明

### users 表

存储用户账户信息。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|------|
| id | Integer | 主键，自增，索引 | 用户ID |
| username | String | 非空，唯一，索引 | 用户名 |
| email | String | 非空，唯一，索引 | 电子邮箱 |
| password_hash | String | 非空 | 密码哈希 |
| is_active | Boolean | 默认值: true | 账户是否激活 |
| is_superuser | Boolean | 默认值: false | 是否为管理员 |
| created_at | DateTime | 默认为当前时间 | 创建时间 |
| updated_at | DateTime | 默认为当前时间，自动更新 | 更新时间 |

### recipes 表

存储菜谱信息。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|------|
| id | Integer | 主键，自增，索引 | 菜谱ID |
| title | String(100) | 非空，索引 | 菜谱标题 |
| description | Text | 可空 | 菜谱描述 |
| difficulty | Integer | 可空 | 难度等级(1-5) |
| cooking_time | Integer | 可空 | 烹饪时间(分钟) |
| servings | Integer | 可空 | 食用人数 |
| user_id | Integer | 外键，引用users.id | 创建用户ID |
| main_image_id | UUID | 外键，引用images.id，可空 | 主图片ID |
| ingredients | JSONB | 可空 | 食材列表(JSON格式) |
| steps | JSONB | 可空 | 烹饪步骤(JSON格式) |
| tags | ARRAY(String) | 可空 | 标签数组 |
| created_at | DateTime | 默认为当前时间 | 创建时间 |
| updated_at | DateTime | 默认为当前时间，自动更新 | 更新时间 |

### cooking_records 表

存储用户的菜谱烹饪记录。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|------|
| id | Integer | 主键，自增，索引 | 记录ID |
| recipe_id | Integer | 外键，引用recipes.id | 菜谱ID |
| user_id | Integer | 外键，引用users.id | 用户ID |
| rating | Integer | 可空 | 评分(1-5) |
| notes | Text | 可空 | 笔记内容 |
| images | ARRAY(String) | 可空 | 图片路径数组 |
| actual_time | Integer | 可空 | 实际烹饪时间(分钟) |
| created_at | DateTime | 默认为当前时间 | 创建时间 |

### images 表

存储上传的图片信息。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|------|
| id | UUID | 主键，默认为uuid.uuid4() | 图片ID |
| file_path | String(255) | 非空 | MinIO中的文件路径 |
| original_filename | String(255) | 可空 | 原始文件名 |
| mime_type | String(50) | 可空 | MIME类型 |
| file_size | Integer | 可空 | 文件大小(字节) |
| width | Integer | 可空 | 图片宽度 |
| height | Integer | 可空 | 图片高度 |
| ai_tags | JSONB | 可空 | AI分析标签(JSON格式) |
| created_at | DateTime | 默认为当前时间 | 创建时间 |

## 表关系说明

### users 表关系

- 一个用户可以有多个菜谱 (1:n)
- 一个用户可以有多个烹饪记录 (1:n)

### recipes 表关系

- 一个菜谱属于一个用户 (n:1)
- 一个菜谱可以有一个主图片 (1:1)
- 一个菜谱可以有多个烹饪记录 (1:n)

### cooking_records 表关系

- 一个烹饪记录属于一个菜谱 (n:1)
- 一个烹饪记录属于一个用户 (n:1)

### images 表关系

- 一个图片可以作为多个菜谱的主图片 (1:n)

## JSONB 字段结构

### recipes.ingredients 结构

```json
[
  {
    "name": "食材名称",
    "quantity": "数量",
    "unit": "单位"
  }
]
```

### recipes.steps 结构

```json
[
  {
    "step_number": 1,
    "description": "步骤描述",
    "image": "可选的步骤图片路径"
  }
]
```

### images.ai_tags 结构

```json
{
  "tags": ["标签1", "标签2"],
  "description": "AI生成的图片描述",
  "ingredients": ["识别出的食材1", "识别出的食材2"],
  "analysis": "菜品分析结果"
}
```

## 索引说明

系统中的主要索引：

1. users 表
   - 主键索引: id
   - 唯一索引: username, email

2. recipes 表
   - 主键索引: id
   - 索引: title, user_id

3. cooking_records 表
   - 主键索引: id
   - 索引: recipe_id, user_id

4. images 表
   - 主键索引: id

## 数据完整性约束

- 外键约束确保数据引用的完整性
- 当删除菜谱时，相关的烹饪记录会被级联删除
- 用户名和电子邮箱设置为唯一，防止重复注册 