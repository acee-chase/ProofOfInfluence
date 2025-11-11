# Slack AI Collaboration Guide

三 AI 协同工作的 Slack 集成指南 - Cursor, Codex, Replit

---

## 📋 目录

- [概述](#概述)
- [Slack Workspace 设置](#slack-workspace-设置)
- [AI Bot 配置](#ai-bot-配置)
- [协作频道结构](#协作频道结构)
- [工作流程](#工作流程)
- [Slack 命令](#slack-命令)
- [通知规则](#通知规则)
- [最佳实践](#最佳实践)

---

## 概述

使用 Slack 作为三 AI 的协作中枢：

```
Slack Workspace (proofofinfluence)
  ├── #ai-coordination (任务分配频道)
  ├── #cursor-dev (Cursor 开发频道)
  ├── #codex-contracts (Codex 合约频道)
  ├── #replit-deploy (Replit 部署频道)
  └── #github-commits (Git 提交通知)
      ↓
  Custom GPT → Slack API → Route to AI
      ↓
  AI → Slack → Update Status
```

### 为什么选择 Slack?

| 特性 | GitHub Issues | Slack |
|------|--------------|-------|
| **实时性** | ❌ 异步 | ✅ 即时 |
| **对话式** | ⚠️ 有限 | ✅ 原生支持 |
| **通知** | ⚠️ 邮件为主 | ✅ 多种方式 |
| **集成** | ⚠️ 有限 | ✅ 丰富 |
| **成本** | ✅ 免费 | ✅ 免费版够用 |
| **易用性** | ⚠️ 需要熟悉 | ✅ 直观 |

---

## Slack Workspace 设置

### 1. 创建 Workspace

**名称**: `proofofinfluence` (或你的项目名)

**地址**: `proofofinfluence.slack.com`

### 2. 创建频道

```bash
# 核心频道
/create #ai-coordination      # 任务协调
/create #cursor-dev           # Cursor 开发
/create #codex-contracts      # Codex 合约
/create #replit-deploy        # Replit 部署

# 辅助频道
/create #github-commits       # Git 提交通知
/create #bug-reports          # Bug 报告
/create #feature-requests     # 功能请求
/create #general              # 一般讨论
```

### 3. 频道说明

#### #ai-coordination (主协调频道)

**用途**: 任务分配、状态更新、AI 间通信

**成员**: 所有 AI、项目管理者

**频道描述**:
```
🤖 AI Task Coordination Hub
- Create tasks with /task command
- AIs report status here
- Central source of truth
```

#### #cursor-dev (Cursor 开发频道)

**用途**: Cursor 开发工作、代码讨论

**成员**: Cursor AI、相关开发者

**频道描述**:
```
🎨 Cursor AI Development Channel
- Frontend & Backend development
- Code reviews and discussions
- Integration work
```

#### #codex-contracts (Codex 合约频道)

**用途**: Codex 智能合约开发

**成员**: Codex AI、区块链开发者

**频道描述**:
```
📜 Codex Smart Contracts Channel
- Smart contract development
- Contract testing and deployment
- Security reviews
```

#### #replit-deploy (Replit 部署频道)

**用途**: Replit 部署和测试

**成员**: Replit AI、DevOps

**频道描述**:
```
🚀 Replit Deployment Channel
- Deployment notifications
- Testing results
- Environment management
```

#### #github-commits (Git 通知频道)

**用途**: GitHub 事件自动通知

**成员**: 所有人 (只读)

**集成**: GitHub App

---

## AI Bot 配置

### 方案 A: Custom GPT + Slack API (推荐)

**优点**: 无需服务器、免费、易设置

**架构**:
```
User → Custom GPT → Slack API (via Actions)
                         ↓
                    Post to channels
                         ↓
                    Notify specific AI
```

#### 1. 创建 Slack App

访问: https://api.slack.com/apps

1. **Create New App** → From scratch
2. **App Name**: `ProofOfInfluence AI Coordinator`
3. **Workspace**: 选择你的 workspace

#### 2. 配置 OAuth & Permissions

**Bot Token Scopes** 添加:
```
chat:write          # 发送消息
chat:write.public   # 在公共频道发送
channels:read       # 读取频道列表
channels:history    # 读取频道历史
users:read          # 读取用户信息
files:write         # 上传文件 (可选)
```

**Install to Workspace** → 授权

**复制 Bot User OAuth Token**: `xoxb-...`

#### 3. 配置 Event Subscriptions (接收消息)

**Request URL**: 需要一个公开的 endpoint (见方案 B)

**Subscribe to bot events**:
```
message.channels    # 频道消息
app_mention         # @提及
```

### 方案 B: 独立 Slack Bot Server (高级)

如果需要 AI 主动响应 Slack 消息，需要部署一个 Bot Server。

**部署位置**: Replit、Vercel、Railway

**代码示例**: 见 `api-server/slack-bot.ts`

---

## 协作频道结构

### 频道权限

| 频道 | Cursor | Codex | Replit | Human |
|------|--------|-------|--------|-------|
| #ai-coordination | ✅ 读写 | ✅ 读写 | ✅ 读写 | ✅ 管理 |
| #cursor-dev | ✅ 读写 | ✅ 只读 | ✅ 只读 | ✅ 读写 |
| #codex-contracts | ✅ 只读 | ✅ 读写 | ✅ 只读 | ✅ 读写 |
| #replit-deploy | ✅ 只读 | ✅ 只读 | ✅ 读写 | ✅ 读写 |
| #github-commits | ✅ 只读 | ✅ 只读 | ✅ 只读 | ✅ 只读 |

---

## 工作流程

### Workflow 1: 创建新任务

```
1. User 在 #ai-coordination 发送任务请求:
   "需要实现 POI 代币质押功能"

2. Custom GPT 或 Human 创建任务:
   /task create "实现 POI 质押合约" @codex

3. Slack Bot 发送消息到 #ai-coordination:
   ─────────────────────────────
   📋 新任务 #001
   标题: 实现 POI 质押合约
   分配给: @codex
   状态: 🟡 待开始
   优先级: 高
   ─────────────────────────────
   
   并 @ 提及 Codex

4. Codex 在 #codex-contracts 开始工作:
   "✅ 已接受任务 #001，开始开发质押合约"

5. Codex 完成后在 #ai-coordination 更新:
   /task complete 001 "质押合约已完成，branch: codex/feat-staking"

6. Slack Bot @ 提及下一个 AI:
   @cursor 请集成新的质押合约到前端
```

### Workflow 2: 代码提交 → 自动部署

```
1. Cursor 提交代码:
   git commit -m "feat(frontend): add staking UI (Cursor)"
   git push origin dev

2. GitHub → Slack (#github-commits):
   🔔 New commit on dev
   feat(frontend): add staking UI (Cursor)
   Author: acee-chase
   Files: 5 changed

3. Slack Bot 分析提交:
   检测到前端变更 → 通知 Replit

4. 在 #ai-coordination 发送:
   @replit 新代码已推送到 dev，请部署到测试环境

5. Replit 在 #replit-deploy 响应:
   "✅ 开始部署到 https://dev-poi.replit.app"

6. 部署完成后更新:
   "✅ 部署成功
   URL: https://dev-poi.replit.app
   时间: 2025-11-11 15:30 UTC
   测试: 全部通过 ✅"
```

### Workflow 3: Bug 修复

```
1. User 在 #bug-reports 报告:
   "钱包连接在移动端失败"

2. Custom GPT 或 Human 在 #ai-coordination:
   /task create "修复移动端钱包连接" @cursor priority:high

3. Cursor 在 #cursor-dev:
   "🔍 正在调查移动端钱包问题..."
   (分享调试日志、代码片段)

4. Cursor 修复并提交:
   git commit -m "fix(wallet): mobile connection issue (Cursor)"

5. Cursor 在 #ai-coordination:
   /task complete 002 "已修复，请 @replit 部署"

6. Replit 部署并验证:
   "✅ Hotfix 已部署，移动端连接正常"
```

---

## Slack 命令

### 任务管理命令

#### `/task create`
创建新任务

**语法**:
```
/task create "<标题>" @ai [priority:high|medium|low]
```

**示例**:
```
/task create "添加代币燃烧功能" @codex priority:high
/task create "优化首页加载速度" @cursor
/task create "部署到 Base 主网" @replit priority:high
```

#### `/task complete`
完成任务

**语法**:
```
/task complete <task_id> "<完成说明>"
```

**示例**:
```
/task complete 001 "燃烧功能已实现，branch: codex/feat-burn"
/task complete 042 "首页加载速度提升 60%"
```

#### `/task update`
更新任务状态

**语法**:
```
/task update <task_id> status:<新状态> [note:"<备注>"]
```

**状态**:
- `pending` 🟡 待开始
- `in_progress` 🔵 进行中
- `blocked` 🔴 被阻塞
- `review` 🟣 待审查
- `done` 🟢 已完成

**示例**:
```
/task update 001 status:in_progress
/task update 005 status:blocked note:"等待 Codex 完成合约"
```

#### `/task list`
列出任务

**语法**:
```
/task list [@ai] [status:<状态>]
```

**示例**:
```
/task list                    # 所有任务
/task list @cursor            # Cursor 的任务
/task list status:in_progress # 进行中的任务
```

#### `/task assign`
重新分配任务

**语法**:
```
/task assign <task_id> @new_ai
```

**示例**:
```
/task assign 007 @replit
```

---

### 部署命令

#### `/deploy`
请求部署

**语法**:
```
/deploy <environment> [branch:<分支>]
```

**示例**:
```
/deploy staging              # 部署到测试环境
/deploy production branch:main  # 部署主分支到生产
```

#### `/status`
查看系统状态

**语法**:
```
/status [component]
```

**示例**:
```
/status              # 全部状态
/status frontend     # 前端状态
/status contracts    # 合约状态
```

---

### 信息查询命令

#### `/ai-status`
查看 AI 状态

**示例**:
```
/ai-status

回复:
🤖 AI Status Report

@cursor: 🟢 Online
  - Current task: #015 (Dashboard refactor)
  - Last active: 2 minutes ago

@codex: 🟢 Online
  - Current task: None
  - Last active: 10 minutes ago

@replit: 🟡 Busy
  - Current task: #020 (Production deployment)
  - Last active: just now
```

#### `/help`
显示帮助

**示例**:
```
/help
/help task
/help deploy
```

---

## 通知规则

### Git 提交通知

**GitHub → Slack 集成**

在 #github-commits 自动显示:
```
🔔 New Push to dev
feat(frontend): add dashboard widget (Cursor)
├── client/src/Dashboard.tsx
├── client/src/api.ts
└── 2 more files...
View: https://github.com/.../commit/abc123
```

**触发规则**:
- Push to `dev` → 通知 #github-commits
- Push to `main` → 通知 #github-commits + #ai-coordination
- 包含 `(Codex)` → @ 提及 @cursor (需要集成)
- 包含 `(Cursor)` → @ 提及 @replit (可能需要部署)

### AI 任务通知

**创建任务**:
```
#ai-coordination: @ 提及被分配的 AI
AI 专属频道: 发送任务详情
```

**完成任务**:
```
#ai-coordination: 更新任务状态
可能 @ 提及下一个 AI
```

**阻塞任务**:
```
#ai-coordination: 红色警告 + @ 提及依赖的 AI
```

### 部署通知

**开始部署**:
```
#replit-deploy: 🚀 Starting deployment...
#ai-coordination: @ 提及请求部署的人
```

**部署成功**:
```
#replit-deploy: ✅ Deployment successful
#ai-coordination: ✅ 简要通知
```

**部署失败**:
```
#replit-deploy: ❌ Deployment failed + 错误日志
#ai-coordination: ❌ 警告 + @ 提及 @cursor (如果是代码问题)
```

---

## 消息格式规范

### 任务消息格式

```
📋 任务 #<ID>: <标题>

**分配给**: @ai
**状态**: 🟡 待开始 | 🔵 进行中 | 🟢 已完成 | 🔴 被阻塞
**优先级**: 🔥 高 | ⚡ 中 | 📌 低
**创建时间**: 2025-11-11 10:00 UTC
**描述**: <任务描述>

[按钮] 开始任务 | 查看详情 | 更新状态
```

### 完成消息格式

```
✅ 任务完成 #<ID>

**标题**: <任务标题>
**完成人**: @ai
**完成时间**: 2025-11-11 15:30 UTC

**变更**:
- 文件1.tsx
- 文件2.sol

**分支**: branch-name
**提交**: abc123

**下一步**: @next-ai 请 [行动]
```

### 部署消息格式

```
🚀 部署报告

**环境**: Production | Staging | Testing
**分支**: main | dev
**提交**: abc123 (feat: new feature)
**开始时间**: 2025-11-11 14:00 UTC
**完成时间**: 2025-11-11 14:05 UTC
**状态**: ✅ 成功 | ❌ 失败

**URL**: https://app.replit.app
**测试**: ✅ 全部通过

**变更**:
- 前端: 5 个文件
- 后端: 2 个文件
- 合约: 0 个文件
```

---

## Custom GPT 集成

### GPT Actions 配置

**OpenAPI Schema** (添加到 Custom GPT Actions):

```yaml
openapi: 3.0.0
info:
  title: Slack AI Coordination API
  version: 1.0.0
servers:
  - url: https://slack.com/api
paths:
  /chat.postMessage:
    post:
      operationId: sendSlackMessage
      summary: Send message to Slack channel
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                channel:
                  type: string
                  description: Channel ID (e.g. C01234567)
                text:
                  type: string
                  description: Message text
                blocks:
                  type: array
                  description: Rich message blocks
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Message sent successfully
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: Bot Token (xoxb-...)
```

**Authentication**:
- Type: Bearer Token
- Token: `xoxb-your-slack-bot-token`

### GPT Instructions (示例)

```
你是 ProofOfInfluence 项目的 AI 协调助手。

当用户请求功能时:
1. 分析任务类型
2. 确定应该分配给哪个 AI (@cursor, @codex, @replit)
3. 使用 sendSlackMessage 发送到 #ai-coordination
4. @ 提及对应的 AI

任务分配规则:
- 智能合约开发 → @codex
- 前端/后端开发 → @cursor
- 部署/测试 → @replit
- 跨组件集成 → 先 @codex，后 @cursor

消息格式:
📋 新任务: <标题>
@ai 请 [具体行动]
优先级: [高/中/低]
```

---

## 最佳实践

### Do's ✅

1. **清晰的任务描述**
   ```
   好: "实现 POI 代币质押功能，支持灵活期限和固定收益率"
   差: "做质押"
   ```

2. **及时更新状态**
   ```
   AI 开始工作时: /task update 001 status:in_progress
   遇到问题时: /task update 001 status:blocked note:"等待 X"
   完成时: /task complete 001 "详细说明"
   ```

3. **使用 Thread 讨论细节**
   - 主频道发任务
   - Thread 中讨论实现细节
   - 避免淹没主要信息

4. **标注 AI 身份**
   ```
   Cursor: "✅ 前端 UI 已完成 (Cursor)"
   Codex: "📜 合约已部署到测试网 (Codex)"
   Replit: "🚀 生产环境已更新 (Replit)"
   ```

5. **链接相关资源**
   ```
   "分支: https://github.com/.../tree/feat-staking"
   "预览: https://dev-poi.replit.app"
   "合约: https://basescan.org/address/0x..."
   ```

### Don'ts ❌

1. **不要创建太多频道**
   - 保持 4-5 个核心频道
   - 避免信息分散

2. **不要在多个频道重复发送**
   - 任务分配在 #ai-coordination
   - 工作细节在专属频道
   - 通知在对应频道

3. **不要跳过状态更新**
   - 即使是小任务也要 /task complete
   - 保持任务追踪准确

4. **不要忽略 @ 提及**
   - AI 被 @ 提及应该尽快响应
   - 如果无法处理,说明原因

5. **不要在 Slack 存储敏感信息**
   - 私钥 → Replit Secrets
   - API Keys → 环境变量
   - 配置 → Git (加密)

---

## Slack Workflow Builder (可选)

使用 Slack 内置的 Workflow Builder 自动化常见流程:

### Workflow 1: 新任务创建

**触发**: 快捷方式 "Create AI Task"

**步骤**:
1. 表单收集: 任务标题、AI、优先级
2. 发送到 #ai-coordination
3. @ 提及对应 AI
4. 添加 reaction 表情 (🟡 待开始)

### Workflow 2: 部署请求

**触发**: 快捷方式 "Request Deployment"

**步骤**:
1. 表单收集: 环境、分支
2. 发送到 #replit-deploy
3. @ 提及 @replit
4. 记录到部署日志

### Workflow 3: Bug 报告

**触发**: 快捷方式 "Report Bug"

**步骤**:
1. 表单收集: Bug 描述、严重性、截图
2. 发送到 #bug-reports
3. 自动创建任务分配给 @cursor
4. 如果严重性=高，发送紧急通知

---

## 监控和分析

### Slack Analytics (内置)

查看:
- 消息数量趋势
- 活跃成员
- 响应时间

### 自定义追踪 (可选)

使用 Slack API 统计:
```javascript
// 任务完成率
const taskMetrics = {
  total: 50,
  completed: 42,
  in_progress: 5,
  blocked: 3
};

// AI 响应时间
const aiResponseTime = {
  cursor: "5 分钟",
  codex: "8 分钟",
  replit: "3 分钟"
};
```

---

## 故障排查

### Slack Bot 不响应

**检查**:
1. Bot Token 是否有效
2. Bot 是否在频道中
3. Bot 权限是否足够
4. Bot Server 是否运行 (方案 B)

### 通知没有发送

**检查**:
1. GitHub Integration 是否启用
2. Webhook URL 是否正确
3. Slack App 权限是否配置

### @ 提及不工作

**检查**:
1. 使用 User ID 而非 Display Name
2. Bot 需要 `users:read` 权限

---

## 迁移 Checklist

从 GitHub Issues 迁移到 Slack:

- [x] 删除 GitHub workflows
- [x] 删除 Issue templates
- [ ] 创建 Slack workspace
- [ ] 配置 Slack App 和 Bot
- [ ] 设置频道结构
- [ ] 配置 GitHub → Slack 集成
- [ ] 更新 Custom GPT Actions
- [ ] 测试完整工作流
- [ ] 培训团队使用 Slack 命令

---

## 下一步

1. **立即开始**:
   - 创建 Slack workspace
   - 配置 Bot Token
   - 测试发送消息

2. **第一周**:
   - 迁移活跃任务到 Slack
   - 团队熟悉 Slack 命令
   - 调整工作流程

3. **长期**:
   - 收集反馈优化
   - 添加更多自动化
   - 考虑高级集成 (Slack Bot Server)

---

**Slack 让 AI 协作更自然、更高效！** 🚀

有问题？在 #general 频道提问！

