# Replit 自动部署配置指南

**状态**: 配置文件已就绪，等待 Replit UI 配置  
**预计时间**: 5-10 分钟

---

## ✅ 已完成的准备工作

### 1. 配置文件已就绪
- ✅ `.replit` 文件已配置（开发环境）
- ✅ `replit.yaml` 文件已配置（部署设置）
- ✅ GitHub 仓库已推送最新代码

### 2. 当前配置概览

#### `.replit` (主配置文件)
```toml
modules = ["nodejs-20", "web", "postgresql-16"]
run = "npm run dev"

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[deployment.autoscale]
# 在 replit.yaml 中定义
```

#### `replit.yaml` (部署配置)
```yaml
[deployment.autoscale]
minInstances = 0  # 无流量时为 0（省钱）
maxInstances = 3  # 高流量时最多 3 个实例
```

---

## 🚀 Replit 部署步骤（详细图文）

### 步骤 1: 导入项目到 Replit (5分钟)

#### 方式 A: 从 GitHub 导入（推荐）✨

1. **访问 Replit**
   ```
   https://replit.com/
   ```

2. **点击 "Create" 按钮**
   - 位置：右上角

3. **选择 "Import from GitHub"**
   - 点击 GitHub 图标

4. **授权 GitHub 访问**
   - 如果首次使用，会要求授权
   - 点击 "Authorize Replit"
   - 选择授权的仓库范围（可以只授权 ProofOfInfluence）

5. **选择仓库**
   - 搜索或选择：`chickendinner-chase/ProofOfInfluence`
   - 点击 "Import"

6. **等待导入完成**
   - Replit 会自动：
     - ✅ 识别 TypeScript 项目
     - ✅ 读取 `.replit` 配置
     - ✅ 安装 Node.js 20 环境
     - ✅ 识别 PostgreSQL 需求

---

### 步骤 2: 配置环境变量 (Secrets) (3分钟)

#### 2.1 打开 Secrets 面板
1. 在 Replit 项目中，点击左侧工具栏的 **🔒 图标**（Secrets）
2. 或者点击左下角 "Tools" → "Secrets"

#### 2.2 添加必需的 Secrets

**必需配置** ⚠️：

| Key | Value | 说明 |
|-----|-------|------|
| `DATABASE_URL` | `postgresql://...` | Neon 数据库连接字符串 |
| `SESSION_SECRET` | `<32位随机字符>` | 会话加密密钥 |

**如何获取 DATABASE_URL**:
```bash
# 访问 Neon.tech
https://neon.tech/

# 步骤:
1. 登录/注册 Neon
2. 创建新项目
3. 复制连接字符串（类似于）:
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname
4. 粘贴到 Replit Secrets 的 DATABASE_URL
```

**如何生成 SESSION_SECRET**:
```bash
# 方式 1: 使用 Replit Shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方式 2: 在线生成
https://randomkeygen.com/ (选择 256-bit WPA Key)

# 复制生成的密钥到 SESSION_SECRET
```

**可选配置**:

| Key | Value | 说明 |
|-----|-------|------|
| `NODE_ENV` | `production` | 环境标识 |
| `PORT` | `5000` | 端口号（通常自动设置） |

#### 2.3 验证 Secrets
- ✅ 确认 DATABASE_URL 格式正确（以 `postgresql://` 开头）
- ✅ 确认 SESSION_SECRET 至少 32 字符
- ✅ 点击每个 Secret 右侧的 ✓ 保存

---

### 步骤 3: 配置自动部署 (5分钟) ⭐

#### 3.1 打开 Deployments 页面
1. 点击左侧工具栏的 **🚀 图标**（Deployments）
2. 或者点击顶部 "Deploy" 按钮

#### 3.2 创建 Production Deployment
1. **点击 "Create deployment"** 或 "New deployment"

2. **配置部署设置**:

   **Deployment Type**: 选择 **Autoscale** ✅
   ```
   为什么选 Autoscale？
   - 自动根据流量调整实例数
   - 无流量时缩减到 0（省钱）
   - 高流量时自动扩展（性能）
   ```

   **Branch**: 选择 **main** ✅
   ```
   推送到 main 分支会自动触发部署
   ```

   **Build Command**: 自动识别
   ```
   npm run build
   （来自 .replit 配置）
   ```

   **Run Command**: 自动识别
   ```
   npm start
   （来自 .replit 配置）
   ```

3. **高级设置（可选）**:
   - **Environment**: Production
   - **Auto-deploy**: ✅ **启用**（重要！）
   - **Health checks**: ✅ 启用（推荐）

4. **点击 "Deploy"** 开始首次部署

---

### 步骤 4: 等待首次部署完成 (2-5分钟)

#### 4.1 监控部署进度
- 部署状态会实时显示
- 可以点击 "View logs" 查看详细日志

#### 4.2 部署阶段
```
1. Building... (构建阶段)
   └─ npm install
   └─ npm run build
   └─ 编译 TypeScript

2. Starting... (启动阶段)
   └─ npm start
   └─ 连接数据库
   └─ 启动服务器

3. Running ✅ (运行成功)
   └─ 生成部署 URL
```

#### 4.3 部署成功标志
- ✅ 状态显示 "Running" 或 "Active"
- ✅ 显示绿色的 ✓
- ✅ 生成了部署 URL（类似 `https://proofofinfluence.username.repl.co`）

---

### 步骤 5: 验证部署 (2分钟)

#### 5.1 访问部署 URL
1. 点击 Deployments 页面的 URL
2. 或者复制 URL 在新标签页打开

#### 5.2 测试关键功能
- [ ] ✅ 页面能正常加载
- [ ] ✅ Landing 页面显示正常
- [ ] ✅ "Sign in with Google" 按钮存在
- [ ] ✅ 主题切换功能正常
- [ ] ✅ 无 JavaScript 错误（打开 DevTools Console 检查）

#### 5.3 测试登录流程（如果已配置 Replit Auth）
- [ ] ✅ 点击登录按钮
- [ ] ✅ Google OAuth 流程正常
- [ ] ✅ 登录后跳转到 Dashboard

---

### 步骤 6: 配置 Auto-deploy from GitHub (关键) ⭐

#### 6.1 确认 Auto-deploy 已启用
1. 在 Deployments 页面
2. 找到你的 Production deployment
3. 点击 "Settings" 或 ⚙️ 图标
4. 确认 **"Auto-deploy on push"** 已勾选 ✅

#### 6.2 测试自动部署
```bash
# 在本地创建一个测试提交
echo "# Test auto-deploy" >> TEST_DEPLOY.md
git add TEST_DEPLOY.md
git commit -m "test: verify auto-deploy from GitHub"
git push origin main

# 等待 1-2 分钟
# 在 Replit Deployments 页面应该会看到新的部署
```

#### 6.3 验证自动部署成功
- ✅ Replit 检测到 GitHub 推送
- ✅ 自动触发新的部署
- ✅ 部署成功并更新 URL
- ✅ 新的改动在生产环境可见

#### 6.4 清理测试文件
```bash
git rm TEST_DEPLOY.md
git commit -m "chore: remove test file"
git push origin main
```

---

## 🎯 配置验证清单

### ✅ Replit 项目配置
- [ ] 项目已从 GitHub 导入
- [ ] Node.js 20 环境已识别
- [ ] PostgreSQL 模块已加载
- [ ] `.replit` 配置被正确读取

### ✅ Secrets 配置
- [ ] `DATABASE_URL` 已设置
- [ ] `SESSION_SECRET` 已设置
- [ ] Secrets 格式正确（无空格、引号等）

### ✅ Deployment 配置
- [ ] Production deployment 已创建
- [ ] Deployment type 为 Autoscale
- [ ] Branch 设置为 main
- [ ] **Auto-deploy on push** 已启用 ⭐

### ✅ 功能验证
- [ ] 部署 URL 可以访问
- [ ] 页面正常显示
- [ ] 无 JavaScript 错误
- [ ] 数据库连接正常

### ✅ 自动部署测试
- [ ] Git push 触发自动部署
- [ ] 部署成功完成
- [ ] 改动在生产环境生效

---

## 🔧 常见问题排查

### Q1: 部署失败，显示 "Build failed"
**原因**: 构建过程出错

**解决**:
1. 查看 Deployment logs
2. 检查常见问题：
   ```bash
   # 本地测试构建是否成功
   npm run build
   
   # 如果失败，修复后推送
   git add .
   git commit -m "fix: resolve build errors"
   git push origin main
   ```

### Q2: 部署成功但页面打不开
**原因**: 可能是 Secrets 配置问题

**解决**:
1. 检查 Replit Secrets
2. 确认 `DATABASE_URL` 格式正确
3. 确认 `SESSION_SECRET` 已设置
4. 在 Replit Shell 测试连接：
   ```bash
   node -e "console.log(process.env.DATABASE_URL)"
   ```

### Q3: 推送到 GitHub 但没有自动部署
**原因**: Auto-deploy 未启用

**解决**:
1. Deployments → Settings
2. 确认 "Auto-deploy on push" ✅ 已勾选
3. 确认监听的分支是 `main`
4. 手动触发一次部署测试

### Q4: 首次部署太慢（> 10分钟）
**原因**: 首次部署需要安装所有依赖

**解决**:
- ✅ 这是正常的，等待完成
- ✅ 后续部署会快很多（1-2分钟）
- ✅ 查看 logs 确认没有卡住

### Q5: Autoscale 冷启动时间长
**原因**: `minInstances = 0` 时，无流量会完全停止

**解决**:
- 如果需要秒开，修改 `replit.yaml`:
  ```yaml
  [deployment.autoscale]
  minInstances = 1  # 改为 1，常驻一个实例
  maxInstances = 3
  ```
- 权衡: 
  - minInstances = 0: 省钱，冷启动 10-30 秒
  - minInstances = 1: 持续计费，秒开

---

## 📊 部署配置对比

### 当前配置（推荐 - 省钱模式）
```yaml
[deployment.autoscale]
minInstances = 0  # 无流量时停止
maxInstances = 3

优势:
✅ 无流量时不计费
✅ 适合开发/测试阶段
✅ 高流量时自动扩展

劣势:
⚠️ 冷启动约 10-30 秒
```

### 常驻模式（秒开，持续计费）
```yaml
[deployment.autoscale]
minInstances = 1  # 始终运行 1 个实例
maxInstances = 3

优势:
✅ 无冷启动，秒开
✅ 适合生产环境
✅ 用户体验更好

劣势:
⚠️ 持续计费（即使无流量）
```

---

## 🎉 完成后的状态

### ✅ 自动化工作流
```
开发者推送代码到 GitHub
    ↓
GitHub 通知 Replit
    ↓
Replit 自动拉取最新代码
    ↓
自动运行 npm run build
    ↓
自动运行 npm start
    ↓
部署完成，更新 URL
    ↓
1-2 分钟后用户可以访问最新版本
```

### ✅ 监控和管理
- 📊 Deployments 页面查看部署历史
- 📝 每次部署都有详细日志
- 🔄 可以回滚到之前的版本
- 📈 查看实例运行状态

---

## 📚 相关文档

- [CHECKLIST.md](../CHECKLIST.md) - 每日工作清单
- [COLLABORATION.md](../COLLABORATION.md) - 4方协作指南
- [WORKFLOW.md](../WORKFLOW.md) - 开发工作流
- [ENV_SETUP.md](ENV_SETUP.md) - 环境变量配置

---

## 🆘 需要帮助？

1. **配置问题**: 查看 [ENV_SETUP.md](ENV_SETUP.md)
2. **部署失败**: 查看 Replit Deployment logs
3. **数据库连接**: 确认 Neon 数据库状态
4. **其他问题**: 
   - 查看 Replit 官方文档
   - 在 GitHub Issues 提问
   - 询问 ChatGPT

---

**最后更新**: 2025-11-02  
**状态**: 配置文件已就绪，等待 Replit UI 配置  
**预计完成时间**: 10-15 分钟

**完成此配置后，您将拥有完全自动化的部署流程！** 🚀

