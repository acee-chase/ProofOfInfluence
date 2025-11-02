# ProofOfInfluence 项目文档

> Web3-enabled link-in-bio platform 项目技术文档

---

## 📁 项目结构

```
ProofOfInfluence/
├── client/                 # 前端应用
│   └── src/
│       ├── components/     # React 组件
│       │   ├── ui/        # Shadcn UI 基础组件
│       │   └── *.tsx      # 业务组件
│       ├── pages/         # 页面组件
│       │   ├── Landing.tsx      # 落地页
│       │   ├── Dashboard.tsx    # 用户仪表板
│       │   └── PublicProfile.tsx # 公开资料页
│       ├── hooks/         # 自定义 Hooks
│       └── lib/           # 工具函数
├── server/                # 后端服务
│   ├── index.ts          # Express 服务器入口
│   ├── routes.ts         # API 路由定义
│   ├── storage.ts        # 数据库抽象层
│   ├── db.ts             # Drizzle 数据库连接
│   └── replitAuth.ts     # 认证逻辑
├── shared/
│   └── schema.ts         # 共享 Schema 和类型
├── collaboration/         # AI协作系统文档
├── docs/                  # 项目文档
├── .cursorrules          # Cursor AI 开发规则
├── replit.yaml           # Replit 部署配置
└── design_guidelines.md  # UI/UX 设计指南
```

---

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** - 类型安全的组件化开发
- **Vite** - 极速构建工具
- **TailwindCSS** - 原子化 CSS
- **Shadcn UI** - 高质量 UI 组件库（基于 Radix UI）
- **TanStack Query** - 服务器状态管理
- **Wouter** - 轻量级路由（7KB）
- **Framer Motion** - 动画库

### 后端
- **Express** + **TypeScript** - RESTful API 服务
- **Drizzle ORM** - 类型安全的数据库 ORM
- **PostgreSQL** - 关系型数据库
- **Neon** - Serverless PostgreSQL 提供商
- **Replit Auth** - OpenID Connect 认证

### Web3
- **MetaMask** - 浏览器钱包集成
- **Web3.js / ethers.js** - 以太坊交互（计划中）

### 开发工具
- **TypeScript 5.6** - 类型系统
- **ESBuild** - 快速打包
- **Drizzle Kit** - 数据库迁移工具

---

## 🗄️ 数据库设计

### users 表
```typescript
{
  id: string              // UUID
  email: string           // 唯一，来自 Google OAuth
  firstName: string
  lastName: string
  profileImageUrl: string
  username: string        // 唯一，可选（设置后资料公开）
  walletAddress: string   // 唯一，可选（Web3 钱包地址）
  createdAt: timestamp
  updatedAt: timestamp
  lastLoginAt: timestamp
}
```

### profiles 表
```typescript
{
  id: string              // UUID
  userId: string          // 外键 → users.id
  name: string            // 显示名称
  bio: string             // 个人简介（200字）
  avatarUrl: string       // 头像URL
  // 社交媒体链接
  googleUrl: string
  twitterUrl: string
  weiboUrl: string
  tiktokUrl: string
  // 统计和设置
  isPublic: boolean       // 是否公开（默认false）
  totalViews: number      // 总浏览量
  createdAt: timestamp
  updatedAt: timestamp
}
```

### links 表
```typescript
{
  id: string              // UUID
  userId: string          // 外键 → users.id
  title: string           // 链接标题
  url: string             // 链接地址
  visible: boolean        // 是否可见（默认true）
  position: number        // 排序位置
  clicks: number          // 点击统计
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 🔌 API 接口

### 认证 API
```
GET  /api/auth/user          # 获取当前用户
GET  /api/login              # 登录（Replit Auth）
GET  /api/logout             # 登出
```

### 资料 API
```
GET    /api/profile           # 获取当前用户资料
POST   /api/profile           # 创建资料
PATCH  /api/profile           # 更新资料
GET    /api/profile/:username # 获取公开资料（无需认证）
```

### 链接 API
```
GET    /api/links              # 获取所有链接
POST   /api/links              # 创建链接
PATCH  /api/links/:id          # 更新链接
DELETE /api/links/:id          # 删除链接
POST   /api/links/reorder      # 重新排序
POST   /api/links/:id/click    # 追踪点击（公开）
```

### 钱包 API
```
POST   /api/wallet/connect     # 连接钱包
DELETE /api/wallet/disconnect  # 断开钱包
```

### 分析 API
```
GET  /api/analytics            # 获取统计数据
```

---

## 🎨 设计系统

详见 [design_guidelines.md](../design_guidelines.md)

### 颜色系统
```css
--primary: 263 70% 50%      /* 紫色 */
--accent: 263 12% 86%       /* 强调色 */
--background: 0 0% 100%     /* 白色（明） / 黑色（暗） */
```

### 排版
- 主字体: Inter
- 等宽字体: Space Grotesk
- 基础字号: 16px
- 行高: 1.5

### 间距
- 容器: p-6 md:p-8
- 组件: space-y-4
- 按钮: py-4 px-6

---

## 🔐 认证流程

### Replit Auth (Google OAuth)
```
1. 用户点击 "Sign in with Google"
2. 重定向到 /api/login
3. Replit Auth 处理 OAuth 流程
4. 回调后创建会话
5. 自动创建用户记录和默认资料
6. 重定向到 Dashboard
```

### Web3 钱包认证
```
1. 用户点击 "Connect Wallet"
2. MetaMask 弹窗请求授权
3. 用户签名验证消息
4. 后端验证签名
5. 绑定钱包地址到用户账户
```

---

## 🚀 部署架构

### 开发环境
```
本地运行:
- Frontend: Vite Dev Server (5173)
- Backend: Express Server (5000)
- Database: Neon PostgreSQL (远程)
```

### 生产环境（Replit）
```
Replit Autoscale:
- minInstances: 0 (省钱模式)
- maxInstances: 3
- 自动扩容/缩容
- WebSocket 支持
- 自定义域名（可选）
```

### 部署流程
```
Git Push → GitHub → Replit Webhook → Auto Deploy
```

---

## 📊 性能指标

### 目标值（MVP阶段）
- 首屏加载: < 2秒
- API 响应: < 200ms
- 数据库查询: < 50ms
- 页面切换: < 100ms

### 监控
- Replit 内置监控
- 浏览器 Performance API
- 错误追踪: Console logs

---

## 🔧 开发命令

```bash
# 开发
npm run dev         # 启动开发服务器
npm run check       # TypeScript 类型检查
npm run build       # 构建生产版本
npm run start       # 启动生产服务器

# 数据库
npm run db:push     # 推送 Schema 变更到数据库

# 注意：没有 test 命令（MVP 阶段）
```

---

## 🐛 调试技巧

### 前端调试
```
1. Chrome DevTools
   - Console: 查看日志和错误
   - Network: 查看 API 请求
   - React DevTools: 组件树和状态

2. Vite 错误提示
   - 浏览器 overlay 显示错误
   - 终端显示编译错误
```

### 后端调试
```
1. Console.log
   - 在关键位置添加日志
   - 生产环境在 Replit 查看

2. Drizzle ORM
   - 查看生成的 SQL 语句
   - 检查查询性能
```

---

## 📚 相关文档

### 快速开始
- [QUICK_START.md](QUICK_START.md) - 10分钟上手指南
- [ENV_SETUP.md](ENV_SETUP.md) - 环境变量配置

### 开发规范
- [../.cursorrules](../.cursorrules) - Cursor AI 开发规则
- [../design_guidelines.md](../design_guidelines.md) - UI/UX 设计规范

### AI协作系统
- [../collaboration/](../collaboration/) - AI协作开发系统文档

---

## 🔄 项目演进

### MVP (已完成)
- ✅ 用户认证（Google OAuth + Web3）
- ✅ 资料管理
- ✅ 链接管理
- ✅ 公开资料页
- ✅ 基础分析

### V1.0 (进行中)
- 🚧 Landing 页面重设计
- 🚧 用户评价展示
- 🚧 社交分享优化

### V2.0 (计划中)
- 📅 自定义主题
- 📅 高级分析（UTM 追踪）
- 📅 NFT 展示
- 📅 API 开放

---

**最后更新**: 2025-11-02  
**维护者**: ProofOfInfluence 团队

