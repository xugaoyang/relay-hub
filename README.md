# RelayHub — AI 中转站聚合导航

> 聚合国内外主流 AI API 中转站，实时监控可用性，多维度横向对比，一键注册携带邀请码

![platforms](https://img.shields.io/badge/收录平台-17个-indigo)
![stack](https://img.shields.io/badge/stack-React%20%2B%20Node.js-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特性

- **平台聚合** — 收录 AiHubMix、302.AI、Burn.Hair、Cubence、TimiCC、兔子API 等 17 个主流中转站
- **实时监控** — 每 5 分钟自动 ping 各平台 `/v1/models` 接口，检测在线状态与延迟
- **模型自动抓取** — 自动获取各平台支持的模型列表
- **多维对比** — 按量价格、订阅套餐、访问方式、支付方式、主打模型一览对比
- **邀请码跳转** — 访客注册时自动携带你的邀请码，无缝引流
- **点击统计** — 记录每个平台的邀请链接点击次数
- **Admin 管理后台** — 添加/编辑/删除平台，填写邀请码

## 🚀 快速开始

**方式一：本地开发**

```bash
# 克隆项目
git clone git@github.com:xugaoyang/relay-hub.git
cd relay-hub

# 启动后端（新终端）
cd backend
npm install
npm run dev        # 运行在 http://localhost:3001

# 启动前端（新终端）
cd frontend
npm install
npm run dev        # 运行在 http://localhost:5173
```

**方式二：Docker Compose**

```bash
docker compose up -d
```

访问地址：
- 前端导航：http://localhost:5173
- 后端 API：http://localhost:3001
- 管理后台：http://localhost:5173/admin

## ⚙️ 配置

### 邀请码

访问 `/admin`，用管理员 Token 登录后为每个平台填写你的邀请码。

用户点击「注册」时，系统自动将注册 URL 中的 `YOUR_CODE` 替换为你填写的邀请码。

### 环境变量

`backend/.env`：

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
ADMIN_TOKEN=relay-hub-admin-2026    # 管理后台 Token，请修改为强密码
```

## 📊 收录平台

| 平台 | 类型 | 访问 | 特色 |
|------|------|------|------|
| AiHubMix | 综合中转 | 国内直连 | GPT/Claude/Gemini 100+ 模型 |
| 302.AI | 综合中转 | 国内直连 | 含绘图/视频生成 |
| OpenRouter | 全球聚合 | 需代理 | 300+ 模型，部分免费 |
| Burn.Hair | 综合中转 | 国内直连 | DeepSeek/GPT/Claude 低价 |
| CloseAI | 综合中转 | 国内直连 | 老牌稳定，运营多年 |
| API2D | 综合中转 | 国内直连 | 支持企业发票 |
| OhMyGPT | 综合中转 | 国内直连 | 注册送额度 |
| DeepBricks | 综合中转 | 需代理 | 低于官方定价 |
| Cubence | Claude专属 | 国内直连 | 速度/价格/缓存综合一流 |
| TimiCC | Claude专属 | 国内直连 | Sonnet ¥4.5/M，支持退款 |
| AICodeMirror | Claude专属 | 国内直连 | 企业级，积分永不过期 |
| 兔子API | 三工具通用 | 国内直连 | 300+ 模型，低至官价 9.56% |
| Weelinking | 200+聚合 | 国内直连 | 一个 Key 管理全部模型 |
| CTok.ai | 综合中转 | 国内直连 | 极速稳定 |
| Groq | 开源推理 | 需代理 | LPU 全球最快，每日免费额度 |
| Together AI | 开源推理 | 需代理 | 100+ 开源模型，注册送 $25 |
| ChatAnyWhere | 免费中转 | 均可 | GPT-3.5 完全免费 |

## 🗂️ 项目结构

```
relay-hub/
├── frontend/                    # React 19 + Vite + Tailwind CSS 4
│   └── src/
│       ├── pages/
│       │   ├── HomePage.tsx     # 平台卡片列表（含搜索/筛选）
│       │   ├── PlatformPage.tsx # 平台详情页
│       │   ├── ComparePage.tsx  # 横向对比表（无横向滚动）
│       │   └── AdminPage.tsx    # 管理后台
│       ├── components/
│       │   ├── Layout.tsx       # 全局布局
│       │   └── StatusDot.tsx    # 状态指示器
│       ├── api.ts               # API 请求封装
│       └── types.ts             # 数据类型定义
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts             # 服务器入口
│   │   ├── db.ts                # JSON 文件存储（含初始平台数据）
│   │   ├── checker.ts           # 定时状态检测（每5分钟）
│   │   ├── types.ts             # 数据类型定义
│   │   └── routes/
│   │       ├── platforms.ts     # 公开 API
│   │       └── admin.ts         # 管理 API（需 Token）
│   ├── data/db.json             # 数据文件（自动生成，勿手动编辑）
│   └── .env                     # 环境变量
└── docker-compose.yml           # Docker 一键部署
```

## 📡 API 文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/platforms` | 获取所有平台列表 |
| GET | `/api/platforms/:id` | 获取单个平台详情 |
| POST | `/api/platforms/:id/click` | 记录点击，返回带邀请码的注册 URL |
| GET | `/api/admin/stats` | 统计数据（需 Admin-Token） |
| POST | `/api/admin/platforms` | 新增平台（需 Admin-Token） |
| PUT | `/api/admin/platforms/:id` | 编辑平台（需 Admin-Token） |
| DELETE | `/api/admin/platforms/:id` | 删除平台（需 Admin-Token） |

Admin API 需在请求头加：`Admin-Token: <你的ADMIN_TOKEN>`

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router v7 |
| 后端 | Node.js · Express 5 · TypeScript · lowdb（JSON存储）|
| 工具 | axios · node-cron · nodemon · ts-node |
| 部署 | Docker Compose |

## 📝 添加新平台

在 Admin 管理页填写以下信息后保存，系统自动开始监控：

- **平台名称 & 描述**
- **API Base URL** — 用于状态检测（`GET /models` 接口）
- **注册 URL** — 格式：`https://example.com/register?aff=YOUR_CODE`
- **我的邀请码** — 系统自动替换 URL 中的 `YOUR_CODE`
- **访问方式** — 国内直连 / 需代理 / 均可
- **主打模型** — 手动标注支持的核心模型
- **支付方式** — 支付宝 / 微信 / 信用卡等

## License

MIT
