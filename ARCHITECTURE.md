# RelayHub 多用户改造方案

## 目标

- 用户可注册账号，独立配置每个中转站的邀请码
- 所有用户共享中转站基础信息（平台名、URL、定价等）
- 未登录访客点击注册链接 → 使用平台默认邀请码（即当前 db.json 中的码）
- 每个用户拥有个人推广主页 `/u/用户名`，分享出去的所有链接自动携带自己的邀请码
- 用户登录后在自己后台管理各平台邀请码

---

## 一、数据模型

### 1.1 现有模型问题

当前 `Platform` 类型中 `inviteCode` 是平台的一个字段，这意味着一个平台只能有一个邀请码。改造后需要拆分为：

- **平台定义**（共享、只读）: 不含 inviteCode
- **用户邀请码**（每人一份）: user_id + platform_id → invite_code

### 1.2 新模型设计

```
Platform（平台定义 — 全局共享，管理员维护）
├── id, name, description, website, apiBaseUrl
├── registerUrl          # 保留 YOUR_CODE 占位符
├── inviteCode           # ← 改名为 defaultInviteCode（管理员/未登录时使用）
├── tags, pros, cons, pricing, accessType
├── keyModels, paymentMethods, since, category
├── featured, sortOrder
├── status, latency, models, lastChecked  # 自动维护
└── clickCount, createdAt, updatedAt

User（用户账号）
├── id: string (uuid)
├── username: string (唯一)
├── passwordHash: string
├── displayName: string
├── createdAt: string

UserInviteCode（用户-平台邀请码关联）
├── id: string
├── user_id: string → User.id
├── platform_id: string → Platform.id
└── inviteCode: string

ClickRecord（点击记录 — 扩展字段）
├── id, platformId, timestamp, userAgent
└── userId?: string       # 新增：记录是谁的邀请码被点击
```

### 1.3 存储方案: JSON → SQLite

| 对比项 | 当前 JSON 文件 | 改为 SQLite |
|--------|---------------|-------------|
| 并发安全 | 需原子写，存在损坏风险 | 内置事务，天然安全 |
| 查询能力 | 全量读内存遍历 | SQL 查询，支持索引 |
| 多用户 | 需手动维护关联 | JOIN 查询即可 |
| 部署 | 零依赖 | 需 `better-sqlite3`（C++编译）或 `sql.js`（纯JS/WASM） |
| 备份 | 手动 JSON 快照 | `.dump` / 文件复制 |

**推荐使用 `better-sqlite3`**（同步 API，性能好，Node.js 生态成熟）。如果 Docker 部署环境无法编译原生模块，备选 `sql.js`（纯 WASM，无需编译）。

迁移策略：
1. 启动时检测是否存在 `data/db.json`
2. 若存在，自动迁移数据到 SQLite（一次性）
3. 后续所有读写走 SQLite
4. 保留 `db.json` 作为备份，不删除

---

## 二、API 设计

### 2.1 新增公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 `{ username, password }` |
| POST | `/api/auth/login` | 用户登录，返回 JWT |
| GET | `/api/auth/me` | 获取当前用户信息（需 JWT） |
| GET | `/api/u/:username` | 获取用户公开信息（profile） |

### 2.2 用户 API（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/invite-codes` | 获取当前用户所有平台的邀请码配置 |
| PUT | `/api/user/invite-codes/:platformId` | 更新某个平台的邀请码 `{ inviteCode }` |
| POST | `/api/user/invite-codes/batch` | 批量更新邀请码 |

### 2.3 平台 API 变更

| 方法 | 路径 | 变更 |
|------|------|------|
| GET | `/api/platforms` | 响应中去掉 `inviteCode` 字段（或用 `defaultInviteCode`），已登录用户额外返回自己的邀请码 |
| GET | `/api/platforms/:id` | 同上 |
| POST | `/api/platforms/:id/click` | 已登录用户使用自己的邀请码；未登录使用 `defaultInviteCode`。新增可选 query `?user=username` 用于 `/u/:username` 页面点击 |

### 2.4 邀请码解析逻辑（核心）

```
POST /api/platforms/:id/click
  Query: ?user=username (可选，来自 /u/:username 页面)

  1. 如果 ?user=username 存在:
       → 查询该用户的 inviteCode for this platform
       → 如果有，用它替换 YOUR_CODE
       → 记录 click，关联该 user

  2. 如果请求带有 JWT（已登录用户）:
       → 查询该用户的 inviteCode for this platform
       → 如果有，用它替换 YOUR_CODE；没有则用 defaultInviteCode
       → 记录 click，关联该 user

  3. 如果未登录且无 ?user:
       → 使用平台的 defaultInviteCode 替换 YOUR_CODE
       → 记录 click，userId 为空
```

---

## 三、路由与页面设计

### 3.1 前端路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 平台列表（不变） |
| `/platform/:id` | PlatformPage | 平台详情（不变） |
| `/compare` | ComparePage | 对比分析（不变） |
| `/login` | LoginPage | 登录页 |
| `/register` | RegisterPage | 注册页 |
| `/dashboard` | DashboardPage | 用户后台（配置邀请码） |
| `/u/:username` | UserProfilePage | 用户公开推广页 |
| `/admin` | AdminPage | 管理后台（保持不变） |

### 3.2 用户推广页 `/u/:username`

这是核心新增页面。用户分享此链接给他人访问。

- 页面展示所有平台卡片，与首页布局一致
- 每个平台的"注册领取福利"按钮点击时，调用 `POST /api/platforms/:id/click?user=username`
- 后端使用该用户配置的邀请码
- 如果用户没配置某平台的邀请码，按钮仍然可用但不带邀请码（或回退到 defaultInviteCode）

### 3.3 用户后台 `/dashboard`

- 登录后可见
- 展示所有平台列表，每个平台旁边有输入框填写邀请码
- 保存后实时更新
- 顶部显示自己的推广链接 `relayhub.com/u/username`，可一键复制

### 3.4 导航栏变化

当前已隐藏"管理后台"按钮。新增：
- 未登录：显示"登录"按钮
- 已登录：显示用户名下拉（我的后台 / 我的推广页 / 退出登录）

---

## 四、未登录访客的邀请码策略

当访客未登录时，点击首页或平台详情页的"注册"按钮：

1. 调用 `POST /api/platforms/:id/click`（不带 JWT，不带 ?user）
2. 后端使用平台的 `defaultInviteCode`（即当前 db.json 中管理员配置的码）
3. `defaultInviteCode` 的来源：
   - 初始值来自 `db.ts` 中 `INITIAL_PLATFORMS` 的 `inviteCode` 字段
   - 管理员可通过 `/admin` 页面修改（保持现有功能）

**效果**：当前 db.json 中的邀请码（AiHubMix: `RTNj`、Cubence: `SCAN84H5` 等）作为全站的默认邀请码，未登录访客点击时使用这些码，管理员获得未登录流量的推广收益。

---

## 五、实施步骤

### 第一阶段: 基础设施（估计 3-4h）

1. **引入 SQLite**
   - 安装 `better-sqlite3` 及类型定义
   - 创建 `backend/src/db/sqlite.ts`：初始化数据库、建表、迁移函数
   - 启动时自动检测并迁移 `db.json` → SQLite

2. **重构 db.ts**
   - 将所有 `readDB` / `writeDB` 替换为 SQLite 操作
   - 保持函数签名不变，确保现有代码无需改动
   - `mergeSeed` 逻辑保持不变，改为 SQL 实现

3. **数据迁移**
   - `Platform.inviteCode` → `Platform.defaultInviteCode`
   - 创建 `users` 表和 `user_invite_codes` 表
   - 自动创建管理员账户（从环境变量读取）

### 第二阶段: 用户系统（估计 3-4h）

4. **后端认证**
   - `backend/src/routes/auth.ts`：注册/登录/JWT 中间件
   - 密码 bcrypt 哈希
   - JWT 签发与验证中间件

5. **用户 API**
   - `backend/src/routes/user.ts`：邀请码 CRUD
   - `GET /api/user/invite-codes` 返回用户所有平台配置

6. **平台 API 调整**
   - `/api/platforms` 和 `/api/platforms/:id` 响应中，`inviteCode` 改为根据用户状态返回
   - `/api/platforms/:id/click` 支持 `?user=` query 和 JWT

### 第三阶段: 前端（估计 4-5h）

7. **登录/注册页面**
   - `LoginPage.tsx`、`RegisterPage.tsx`
   - JWT 存储（localStorage）、全局 AuthContext

8. **用户后台**
   - `DashboardPage.tsx`：平台邀请码配置表格
   - 显示推广链接并支持复制

9. **用户推广页**
   - `UserProfilePage.tsx`：与首页相同布局，但使用 `?user=` API
   - 路由 `App.tsx` 新增 `/u/:username`

10. **导航栏更新**
    - 新增登录状态判断
    - 用户菜单（后台/推广页/退出）

11. **邀请码回填**
    - 首页和平臺详情页的注册按钮，已登录时传 JWT
    - `/u/:username` 页面的按钮传 `?user=username`

### 第四阶段: 平台众包（可选，估计 2-3h）

12. **用户提交新平台**
    - `/dashboard` 中增加"提交新平台"功能
    - 管理员在 `/admin` 审核通过后上线

13. **平台信息协作编辑**
    - 用户可提交平台信息修正（描述、定价等）
    - 管理员审核后合并

---

## 六、关键文件变更清单

```
新增:
  backend/src/db/sqlite.ts          # SQLite 封装
  backend/src/db/migrate.ts         # JSON → SQLite 迁移
  backend/src/routes/auth.ts        # 注册/登录
  backend/src/routes/user.ts        # 用户邀请码管理
  backend/src/middleware/auth.ts    # JWT 验证中间件
  frontend/src/pages/LoginPage.tsx
  frontend/src/pages/RegisterPage.tsx
  frontend/src/pages/DashboardPage.tsx
  frontend/src/pages/UserProfilePage.tsx
  frontend/src/context/AuthContext.tsx

修改:
  backend/src/types.ts              # 新增 User、UserInviteCode 类型
  backend/src/db.ts                 # 底层切换为 SQLite
  backend/src/index.ts              # 注册新路由
  backend/src/routes/platforms.ts   # click 接口支持多用户
  backend/src/routes/admin.ts       # inviteCode → defaultInviteCode
  frontend/src/App.tsx              # 新增路由
  frontend/src/api.ts               # 新增认证/用户 API
  frontend/src/types.ts             # 同步后端类型
  frontend/src/components/Layout.tsx# 导航栏用户状态
  frontend/src/pages/HomePage.tsx   # 注册按钮适配
  frontend/src/pages/PlatformPage.tsx# 注册按钮适配
```

---

## 七、环境变量

```env
# backend/.env
PORT=3001
FRONTEND_URL=http://localhost:5173
ADMIN_TOKEN=relay-hub-admin-2026
JWT_SECRET=change-me-to-a-random-string
DATABASE_PATH=./data/relayhub.db
```

---

## 八、安全注意事项

- 密码使用 bcrypt 哈希存储
- JWT 设置合理过期时间（建议 7 天）
- 注册时校验 username 格式（字母数字下划线，3-20 位）
- CORS 限制为 FRONTEND_URL
- 邀请码输入做基本校验（防止 XSS，纯文本展示不渲染 HTML）
