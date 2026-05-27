#!/bin/bash
# RelayHub 腾讯云服务器一键部署脚本
# 在服务器上执行: bash deploy.sh

set -e

echo "=== RelayHub 部署脚本 ==="

# 1. 安装 Docker（如果未安装）
if ! command -v docker &>/dev/null; then
    echo "[1/4] 安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
else
    echo "[1/4] Docker 已安装，跳过"
fi

# 2. 克隆 / 更新代码
REPO_DIR="/opt/relay-hub"
if [ -d "$REPO_DIR/.git" ]; then
    echo "[2/4] 更新代码..."
    cd "$REPO_DIR"
    git pull
else
    echo "[2/4] 克隆仓库..."
    git clone https://github.com/xugaoyang/relay-hub.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# 3. 配置环境变量
echo "[3/4] 配置环境变量..."
if [ ! -f ".env" ]; then
    cp .env.example .env

    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
    echo "检测到服务器公网 IP: $PUBLIC_IP"

    read -p "请输入域名或 IP（回车使用 $PUBLIC_IP）: " DOMAIN
    DOMAIN=${DOMAIN:-$PUBLIC_IP}
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$DOMAIN|" .env

    read -p "请输入前端端口（80 已占用时建议 8080，回车默认 8080）: " PORT
    PORT=${PORT:-8080}
    sed -i "s|PORT=.*|PORT=$PORT|" .env

    read -p "请输入 ADMIN_TOKEN（回车随机生成）: " TOKEN
    TOKEN=${TOKEN:-$(openssl rand -hex 16)}
    sed -i "s|ADMIN_TOKEN=.*|ADMIN_TOKEN=$TOKEN|" .env

    echo "配置已保存到 .env"
    echo "  FRONTEND_URL=http://$DOMAIN"
    echo "  PORT=$PORT"
fi

# 4. 启动服务
echo "[4/4] 构建并启动服务..."
docker compose up -d --build

PORT=$(grep '^PORT=' .env | cut -d= -f2)
DOMAIN=$(grep '^FRONTEND_URL=' .env | cut -d= -f2 | sed 's|http[s]*://||')

echo ""
echo "=== 部署完成 ==="
echo "访问地址: http://$DOMAIN:$PORT"
echo "管理后台: http://$DOMAIN:$PORT/admin"
echo ""
echo "如果 80 端口已有 nginx，可添加反向代理："
echo "  location / {"
echo "      proxy_pass http://127.0.0.1:$PORT;"
echo "      proxy_set_header Host \$host;"
echo "      proxy_set_header X-Real-IP \$remote_addr;"
echo "      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "  }"
