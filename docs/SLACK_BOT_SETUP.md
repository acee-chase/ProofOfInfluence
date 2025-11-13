# Slack Bot 设置指南

完整的 Slack Bot 配置步骤,用于 ProofOfInfluence AI 协作

---

## 📋 目录

- [前置条件](#前置条件)
- [创建 Slack Workspace](#创建-slack-workspace)
- [创建 Slack App](#创建-slack-app)
- [配置 Bot 权限](#配置-bot-权限)
- [安装 Bot 到 Workspace](#安装-bot-到-workspace)
- [获取 Channel IDs](#获取-channel-ids)
- [配置环境变量](#配置环境变量)
- [测试集成](#测试集成)
- [GitHub 集成](#github-集成)
- [故障排查](#故障排查)

---

## 前置条件

- Slack 账号 (免费版即可)
- Admin 权限 (创建 workspace 和 app)
- API Server 已部署 (Replit 或本地)

---

## 创建 Slack Workspace

### 步骤 1: 创建新的 Workspace

1. 访问: https://slack.com/create
2. 输入邮箱并验证
3. 创建 Workspace:
   - **Workspace Name**: `ProofOfInfluence` (或你的项目名)
   - **Workspace URL**: `proofofinfluence.slack.com`
   - **Purpose**: Development / Team Collaboration

### 步骤 2: 创建频道

在 Workspace 中创建以下频道:

```bash
# 核心频道 (公开)
#ai-coordination      # AI 任务协调
#cursor-dev           # Cursor 开发
#codex-contracts      # Codex 合约
#replit-deploy        # Replit 部署
#github-commits       # Git 提交通知

# 可选频道
#bug-reports          # Bug 报告
#feature-requests     # 功能请求
#general              # 一般讨论
```

**创建方法**:
1. 点击 Workspace 名称 → "Create a channel"
2. 选择 "Public channel"
3. 输入频道名称和描述
4. 点击 "Create"

**频道描述建议**:

- **#ai-coordination**: 🤖 AI Task Coordination Hub - Central place for AI collaboration
- **#cursor-dev**: 🎨 Cursor AI Development - Frontend & Backend work
- **#codex-contracts**: 📜 Codex Smart Contracts - Contract development and testing
- **#replit-deploy**: 🚀 Replit Deployment - Deployment notifications and results
- **#github-commits**: 📝 GitHub Commits - Automatic commit notifications

---

## 创建 Slack App

### 步骤 1: 创建 App

1. 访问: https://api.slack.com/apps
2. 点击 **"Create New App"**
3. 选择 **"From scratch"**
4. 填写信息:
   - **App Name**: `ProofOfInfluence AI Coordinator`
   - **Workspace**: 选择你刚创建的 workspace
5. 点击 **"Create App"**

### 步骤 2: 基本信息

在 **Basic Information** 页面:

1. **Display Information** (可选):
   - **Short Description**: AI coordination bot for ProofOfInfluence
   - **App Icon**: 上传一个机器人图标
   - **Background Color**: `#0E8A16` (绿色)

2. **App Credentials** (保存以下信息):
   - **App ID**: A01234567
   - **Client ID**: 1234567890.1234567890
   - **Client Secret**: abc123... (保密!)
   - **Signing Secret**: abc123... (保密!)

---

## 配置 Bot 权限

### 步骤 1: OAuth & Permissions

1. 左侧菜单 → **OAuth & Permissions**
2. 滚动到 **Scopes** → **Bot Token Scopes**
3. 点击 **"Add an OAuth Scope"** 添加以下权限:

```
chat:write          # 发送消息到频道
chat:write.public   # 发送消息到公共频道 (无需加入)
channels:read       # 读取频道列表
channels:history    # 读取频道历史消息
users:read          # 读取用户信息
files:write         # 上传文件 (可选)
```

**必需权限**:
- `chat:write` - 核心功能
- `chat:write.public` - 无需加入频道即可发送

**可选权限**:
- `channels:read` - 查询频道 ID
- `channels:history` - 读取历史 (如需响应消息)
- `users:read` - 获取用户信息
- `files:write` - 上传日志文件

### 步骤 2: Event Subscriptions (可选)

如果需要 Bot 响应消息 (高级功能):

1. 左侧菜单 → **Event Subscriptions**
2. 开启 **Enable Events**
3. **Request URL**: 
   ```
   https://your-api-server.repl.co/api/slack/events
   ```
   (需要先实现 endpoint,见高级部分)

4. **Subscribe to bot events**:
   ```
   message.channels    # 频道消息
   app_mention         # @提及 Bot
   ```

**注意**: 基础功能不需要 Event Subscriptions,只需要能发送消息。

---

## 安装 Bot 到 Workspace

### 步骤 1: 安装 App

1. 左侧菜单 → **OAuth & Permissions**
2. 滚动到顶部 → 点击 **"Install to Workspace"**
3. 审查权限并点击 **"Allow"**

### 步骤 2: 获取 Bot Token

安装成功后,会显示:

```
✅ Bot User OAuth Token: xoxb-1234567890-1234567890123-abc123def456...
```

**重要**: 
- 复制并保存这个 Token (只显示一次)
- 格式: `xoxb-...`
- 这是你的 `SLACK_BOT_TOKEN`

### 步骤 3: 添加 Bot 到频道 (可选)

如果没有使用 `chat:write.public` 权限:

1. 打开每个频道
2. 点击频道名称 → **Integrations** → **Apps**
3. 点击 **"Add apps"**
4. 选择 **"ProofOfInfluence AI Coordinator"**

**使用 `chat:write.public` 则无需此步骤**

---

## 获取 Channel IDs

### 方法 1: 通过浏览器 URL

1. 打开 Slack 桌面版或网页版
2. 点击频道
3. 查看 URL:
   ```
   https://app.slack.com/client/T01234567/C01234567
                                          ^^^^^^^^^^
                                          Channel ID
   ```
4. `C01234567` 就是 Channel ID

### 方法 2: 通过频道详情

1. 点击频道名称 → **About**
2. 滚动到底部
3. **Channel ID**: `C01234567`

### 方法 3: 使用 API (推荐)

运行以下命令:

```bash
curl https://slack.com/api/conversations.list \
  -H "Authorization: Bearer xoxb-your-bot-token" \
  | jq '.channels[] | {name: .name, id: .id}'
```

输出:
```json
{
  "name": "ai-coordination",
  "id": "C01234567"
}
{
  "name": "cursor-dev",
  "id": "C01234568"
}
```

### Channel IDs 映射表

创建一个映射表:

| 频道名称 | Channel ID | 用途 |
|---------|-----------|------|
| #ai-coordination | C01234567 | 任务协调 |
| #cursor-dev | C01234568 | Cursor 开发 |
| #codex-contracts | C01234569 | Codex 合约 |
| #replit-deploy | C01234570 | Replit 部署 |
| #github-commits | C01234571 | Git 提交 |

---

## 配置环境变量

### Replit 配置 (推荐)

1. 打开 Replit → **Secrets** (锁图标)
2. 添加以下密钥:

```env
SLACK_BOT_TOKEN = xoxb-1234567890-1234567890123-abc123def456...
SLACK_CHANNEL_COORDINATION = C01234567
SLACK_CHANNEL_CURSOR = C01234568
SLACK_CHANNEL_CODEX = C01234569
SLACK_CHANNEL_REPLIT = C01234570
SLACK_CHANNEL_COMMITS = C01234571
```

3. 点击 **"Add new secret"** 逐个添加

### 本地开发配置

创建 `api-server/.env`:

```env
# Slack Bot Configuration
SLACK_BOT_TOKEN=xoxb-1234567890-1234567890123-abc123def456...
SLACK_CHANNEL_COORDINATION=C01234567
SLACK_CHANNEL_CURSOR=C01234568
SLACK_CHANNEL_CODEX=C01234569
SLACK_CHANNEL_REPLIT=C01234570
SLACK_CHANNEL_COMMITS=C01234571

# Existing configuration
GITHUB_TOKEN=ghp_your_token
API_SECRET_KEY=your_secret_key
API_PORT=3001
```

**注意**: 不要提交 `.env` 文件到 Git!

---

## 测试集成

### 测试 1: 发送简单消息

使用 `curl` 测试:

```bash
curl -X POST https://your-api-server.repl.co/api/slack/message \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "coordination",
    "text": "🤖 Slack Bot 测试消息"
  }'
```

**预期结果**: 
- 在 #ai-coordination 频道看到消息
- API 返回 `{"success": true, "message": "Message sent to Slack"}`

### 测试 2: 任务创建通知

```bash
curl -X POST https://your-api-server.repl.co/api/slack/task/create \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "001",
    "title": "测试任务",
    "assignee": "cursor",
    "priority": "high",
    "description": "这是一个测试任务"
  }'
```

(注意: 需要先在 `index.ts` 添加此端点,或直接测试现有的创建任务 API)

### 测试 3: 部署通知

```bash
curl -X POST https://your-api-server.repl.co/api/slack/deployment \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "staging",
    "branch": "dev",
    "commit": "abc123",
    "status": "success",
    "url": "https://dev.replit.app",
    "duration": "2m 15s"
  }'
```

**预期结果**: 
- #replit-deploy 和 #ai-coordination 都收到通知
- 消息格式美观,包含所有信息

---

## GitHub 集成

### 方法 1: GitHub Slack App (推荐)

1. 在 Slack 中添加 GitHub App:
   - 打开 #github-commits 频道
   - 输入 `/github subscribe acee-chase/ProofOfInfluence`
   - 授权 GitHub App

2. 配置通知:
   ```
   /github subscribe acee-chase/ProofOfInfluence commits:all
   /github unsubscribe acee-chase/ProofOfInfluence issues pulls releases
   ```

3. 验证:
   - Push 一个 commit 到 GitHub
   - 检查 #github-commits 是否收到通知

### 方法 2: GitHub Webhook (自定义)

1. 创建 webhook endpoint (`api-server/index.ts`):

```typescript
app.post('/api/github/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  // Verify signature
  const signature = req.headers['x-hub-signature-256'];
  // ... verify logic ...

  const event = req.headers['x-github-event'];
  const payload = JSON.parse(req.body.toString());

  if (event === 'push' && slack) {
    await slack.notifyCommit({
      branch: payload.ref.replace('refs/heads/', ''),
      message: payload.head_commit.message,
      author: payload.head_commit.author.name,
      sha: payload.head_commit.id,
      url: payload.head_commit.url,
      filesChanged: payload.head_commit.modified.length
    });
  }

  res.sendStatus(200);
});
```

2. 在 GitHub 添加 Webhook:
   - 仓库 → Settings → Webhooks → Add webhook
   - Payload URL: `https://your-api-server.repl.co/api/github/webhook`
   - Content type: `application/json`
   - Secret: (生成一个安全的密钥)
   - Events: 选择 `push`

---

## 高级功能

### 交互式消息 (Buttons)

使用 Block Kit 创建带按钮的消息:

```json
{
  "channel": "coordination",
  "text": "新任务已创建",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "📋 *新任务 #001*\n实现市场 API"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "开始任务"
        },
        "action_id": "task_start_001"
      }
    }
  ]
}
```

**需要配置 Interactive Components**:
1. Slack App → **Interactivity & Shortcuts**
2. **Request URL**: `https://your-api-server.repl.co/api/slack/interactive`
3. 实现 endpoint 处理按钮点击

### Slash Commands

创建自定义命令 (如 `/task create`):

1. Slack App → **Slash Commands**
2. **Create New Command**:
   - Command: `/task`
   - Request URL: `https://your-api-server.repl.co/api/slack/commands`
   - Short Description: "Manage AI tasks"
   - Usage Hint: `create|list|complete [args]`

3. 实现 endpoint:

```typescript
app.post('/api/slack/commands', async (req, res) => {
  const { command, text, user_id, channel_id } = req.body;
  
  if (command === '/task') {
    const [action, ...args] = text.split(' ');
    
    if (action === 'create') {
      // Create task logic
      res.json({
        response_type: 'in_channel',
        text: `✅ 任务已创建: ${args.join(' ')}`
      });
    } else if (action === 'list') {
      // List tasks logic
      res.json({
        response_type: 'ephemeral',
        text: `📋 你的任务列表...`
      });
    }
  }
});
```

---

## 故障排查

### 问题 1: Bot Token 无效

**错误**: `Slack API error: invalid_auth`

**解决方案**:
1. 检查 Token 格式是否以 `xoxb-` 开头
2. 确认 Token 正确复制 (无空格)
3. 重新安装 App 获取新 Token

### 问题 2: 消息未发送

**错误**: `Slack API error: channel_not_found`

**解决方案**:
1. 检查 Channel ID 是否正确
2. 确认频道是公开的
3. 如果私有频道,需要邀请 Bot 加入
4. 或使用 `chat:write.public` 权限

### 问题 3: 权限不足

**错误**: `Slack API error: missing_scope`

**解决方案**:
1. 检查 Bot Token Scopes
2. 添加缺失的权限
3. **重新安装 App** (权限更改后必须重装)

### 问题 4: Webhook 未触发

**原因**:
- Request URL 无法访问
- Signature 验证失败
- Endpoint 返回错误

**解决方案**:
1. 测试 URL 可访问性: `curl https://your-url`
2. 检查 Replit 是否在运行
3. 查看 Replit Console 日志
4. 验证 Signature 逻辑正确

### 问题 5: Channel ID 无效

**错误**: `Slack API error: channel_not_found`

**解决方案**:
1. 使用正确方法获取 Channel ID (见上文)
2. 确认频道存在且 Bot 有权限
3. 重启 API Server 加载新配置

---

## 安全最佳实践

### Do's ✅

1. **Token 安全**:
   - 使用 Replit Secrets 存储
   - 不在代码中硬编码
   - 不提交到 Git
   - 定期轮换 Token

2. **权限最小化**:
   - 只添加必需的 Scopes
   - 避免使用 Admin 权限
   - 定期审查权限

3. **验证请求**:
   - Webhook 验证 Signature
   - API 使用 Bearer Token
   - 记录所有请求日志

### Don'ts ❌

1. **不要**暴露 Token:
   - 不在日志中打印
   - 不在错误消息中显示
   - 不通过 URL 参数传递

2. **不要**忽略错误:
   - 处理 API 失败
   - 记录错误日志
   - 实现重试机制

3. **不要**过度使用:
   - 注意 Rate Limits
   - 缓存频繁查询
   - 批量发送消息

---

## 监控和维护

### 日志监控

在 Replit Console 查看:
- Bot 消息发送日志
- API 调用次数
- 错误和警告

### Rate Limits

Slack API Limits:
- **Tier 1**: 1 request/second
- **Tier 2**: 20 requests/minute
- **Tier 3**: 50 requests/minute
- **Tier 4**: 100 requests/minute

**建议**:
- 使用队列批量发送
- 实现 exponential backoff
- 缓存频道列表

### 健康检查

定期检查:
```bash
curl https://your-api-server.repl.co/health
```

返回:
```json
{
  "status": "ok",
  "service": "ProofOfInfluence API Server",
  "slack": "enabled"
}
```

---

## 下一步

✅ Slack Bot 配置完成!

**接下来**:
1. 测试所有 Slack 端点
2. 配置 Custom GPT 使用 Slack API
3. 设置 GitHub → Slack 集成
4. 培训团队使用 Slack 命令
5. 监控和优化

---

## 参考资源

- [Slack API 文档](https://api.slack.com/docs)
- [Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Slack App 管理](https://api.slack.com/apps)
- [ProofOfInfluence Slack 协作指南](./SLACK_COLLABORATION.md)

---

**Slack Bot 已就绪,开始 AI 协作!** 🚀

