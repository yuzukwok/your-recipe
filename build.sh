#!/bin/bash

# 设置日期标签格式 yyyyddmm
TAG=$(date '+%Y%d%m')
SERVER="hl-app"
BACKEND_IMAGE="recipe-backend:${TAG}"
FRONTEND_IMAGE="recipe-frontend:${TAG}"
LOG_DIR="build_logs"

# 默认使用缓存
USE_CACHE=true

# 处理命令行参数
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --no-cache) USE_CACHE=false ;;
        --help) 
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --no-cache    禁用Docker构建缓存"
            echo "  --help        显示帮助信息"
            exit 0
            ;;
        *) echo "未知参数: $1, 使用 --help 查看帮助"; exit 1 ;;
    esac
    shift
done

# 根据USE_CACHE设置缓存参数
if [ "$USE_CACHE" = "false" ]; then
    CACHE_OPTION="--no-cache"
    echo "将禁用构建缓存"
else
    CACHE_OPTION=""
    echo "将使用构建缓存（如需禁用请使用 --no-cache 参数）"
fi

# 确保日志目录存在
mkdir -p ${LOG_DIR}

echo "==============================================="
echo "开始构建前后端镜像，标签: ${TAG}"
echo "==============================================="

# 构建后端镜像
echo "构建后端镜像..."
set -o pipefail
# 添加重试逻辑，最多重试3次
MAX_RETRIES=3
RETRY_COUNT=0
BACKEND_BUILD_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$BACKEND_BUILD_SUCCESS" = "false" ]; do
    echo "后端构建尝试 #$((RETRY_COUNT+1))"
    if docker build --platform linux/amd64 ${CACHE_OPTION} -t ${BACKEND_IMAGE} -f backend/Dockerfile backend 2>&1 | tee ${LOG_DIR}/backend_build_${RETRY_COUNT}.log; then
        BACKEND_BUILD_SUCCESS=true
        echo "后端镜像构建成功: ${BACKEND_IMAGE}"
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "后端构建失败，等待10秒后重试..."
            sleep 10
        fi
    fi
done

if [ "$BACKEND_BUILD_SUCCESS" = "false" ]; then
    echo "后端镜像构建失败，已达到最大重试次数"
    exit 1
fi

# 构建前端镜像
echo "构建前端镜像..."
# 添加重试逻辑，最多重试3次
RETRY_COUNT=0
FRONTEND_BUILD_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$FRONTEND_BUILD_SUCCESS" = "false" ]; do
    echo "前端构建尝试 #$((RETRY_COUNT+1))"
    if docker build --platform linux/amd64 ${CACHE_OPTION} -t ${FRONTEND_IMAGE} -f frontend/Dockerfile frontend 2>&1 | tee ${LOG_DIR}/frontend_build_${RETRY_COUNT}.log; then
        FRONTEND_BUILD_SUCCESS=true
        echo "前端镜像构建成功: ${FRONTEND_IMAGE}"
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "前端构建失败，等待10秒后重试..."
            sleep 10
        fi
    fi
done

if [ "$FRONTEND_BUILD_SUCCESS" = "false" ]; then
    echo "前端镜像构建失败，已达到最大重试次数"
    exit 1
fi

# 保存镜像到文件
echo "==============================================="
echo "保存镜像到文件..."
echo "==============================================="
BACKEND_TAR="recipe-backend-${TAG}.tar"
FRONTEND_TAR="recipe-frontend-${TAG}.tar"

docker save -o ${BACKEND_TAR} ${BACKEND_IMAGE}
docker save -o ${FRONTEND_TAR} ${FRONTEND_IMAGE}

# 确保远程目录存在
echo "检查服务器目录..."
ssh ${SERVER} "mkdir -p ~/docker-images" || {
    echo "无法在服务器上创建目录，请检查SSH连接和权限"
    exit 1
}

# 将镜像文件复制到服务器
echo "==============================================="
echo "复制镜像到服务器 ${SERVER}..."
echo "==============================================="
scp ${BACKEND_TAR} ${SERVER}:~/docker-images/ || {
    echo "复制后端镜像到服务器失败"
    exit 1
}
scp ${FRONTEND_TAR} ${SERVER}:~/docker-images/ || {
    echo "复制前端镜像到服务器失败"
    exit 1
}

# 清理本地临时文件
rm ${BACKEND_TAR} ${FRONTEND_TAR}

echo "==============================================="
echo "构建和部署完成!"
echo "前端镜像: ${FRONTEND_IMAGE}"
echo "后端镜像: ${BACKEND_IMAGE}"
echo "==============================================="


