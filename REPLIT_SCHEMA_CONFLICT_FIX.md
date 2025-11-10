# 🔧 Replit Schema 冲突修复指南

**问题：** Replit 在 merge/pull 时 `shared/schema.ts` 出现冲突

**原因：** Replit 本地有旧的 schema 定义，与新的 Codex API 结构冲突

---

## ✅ 解决方案（3个选项）

### 选项 1：强制使用远程版本（推荐，最快）⚡

在 Replit Shell 执行：

```bash
# 1. 保存当前工作（如果有未提交的更改）
git stash

# 2. 强制拉取远程最新版本
git fetch origin
git reset --hard origin/main

# 3. 如果之前有 stash，可以选择恢复（通常不需要）
# git stash pop
```

**优点：**
- 最快，一步到位
- 保证与 Cursor 本地完全一致
- 没有冲突残留

---

### 选项 2：使用 Git 冲突解决工具

在 Replit Shell 执行：

```bash
# 1. 拉取最新代码（会显示冲突）
git pull origin main

# 2. 接受远程版本（解决 schema.ts 冲突）
git checkout --theirs shared/schema.ts

# 3. 标记冲突已解决
git add shared/schema.ts

# 4. 完成 merge
git commit -m "fix: resolve schema.ts conflict - use remote Codex API version"
```

---

### 选项 3：手动编辑（如果需要保留本地更改）

如果 Replit 有其他本地更改需要保留：

```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑 shared/schema.ts
# 删除所有冲突标记：<<<<<<< ======= >>>>>>>
# 保留远程版本（incoming changes）

# 3. 验证文件没有冲突标记
grep -n "<<<<<<" shared/schema.ts
grep -n ">>>>>>" shared/schema.ts

# 4. 标记已解决
git add shared/schema.ts

# 5. 提交
git commit -m "fix: resolve schema.ts conflict"
```

---

## 🎯 推荐步骤（最佳实践）

**在 Replit 执行：**

```bash
# Step 1: 检查状态
git status

# Step 2: 如果有冲突，使用选项 1（最简单）
git fetch origin
git reset --hard origin/main

# Step 3: 验证
git log --oneline -3
# 应该显示最新的 3 个提交：
# 5bd212e chore: remove temporary branch cleanup files
# 82e2e4f docs: add branch cleanup completion report  
# 9f8127e feat: merge Codex backend API implementation

# Step 4: 确认文件正确
head -20 shared/schema.ts
# 应该看到正确的 imports 和 sessions table

# Step 5: 运行数据库迁移
npm run db:push
```

---

## ✅ 验证清单

解决冲突后，确认以下内容：

- [ ] `git status` 显示 "working tree clean"
- [ ] `shared/schema.ts` 没有冲突标记（`<<<<<<<`, `=======`, `>>>>>>>`）
- [ ] 文件包含新的 Codex API 表定义：
  - [ ] `marketOrders` 有 `quotedAmountOut` 字段
  - [ ] `marketOrders` 有 `idempotencyKey` 字段
  - [ ] `reserveActions` 有 `executedAt` 字段
  - [ ] `products` 有 `title` 字段（不是 `name`）
  - [ ] `taxReports` 有 `periodStart` 和 `periodEnd` 字段

---

## 🚫 常见错误

### 错误 1：尝试 pull 时报错

```
error: Your local changes to the following files would be overwritten by merge:
    shared/schema.ts
```

**解决：** 使用选项 1 的 `git reset --hard origin/main`

### 错误 2：文件中仍有冲突标记

**解决：** 使用选项 2 的 `git checkout --theirs shared/schema.ts`

### 错误 3：数据库 schema 不匹配

```
error: column "quoted_amount_out" does not exist
```

**解决：** 运行 `npm run db:push` 更新数据库

---

## 📋 正确的 Schema 结构预览

解决冲突后，`shared/schema.ts` 应该包含这些表：

### Core Tables (已存在)
- `sessions` - Replit Auth
- `users` - 用户表
- `profiles` - 公开资料
- `links` - 展示链接
- `transactions` - 交易记录
- `poiTiers` - POI 会员等级
- `poiFeeCredits` - 手续费积分
- `poiBurnIntents` - POI 燃烧记录
- `poiFeeCreditLocks` - 积分锁定

### Codex API Tables (新增)
- `marketOrders` - 市场订单（含 `quotedAmountOut`, `idempotencyKey`）
- `marketTrades` - 市场交易
- `feesLedger` - 手续费账本
- `reserveBalances` - 储备金余额
- `reserveActions` - 储备金操作（含 `executedAt`）
- `products` - 商品（含 `title`, `idempotencyKey`）
- `merchantOrders` - 商家订单
- `taxReports` - 税务报表（含 `periodStart`, `periodEnd`）

---

## 🎉 完成后

冲突解决并数据库迁移完成后：

```bash
# 启动服务器
npm run dev

# 测试 API endpoints
curl http://localhost:5000/api/market/stats
curl http://localhost:5000/api/reserve/status
curl http://localhost:5000/api/merchant/products
```

---

## 💡 预防未来冲突

1. **在 Replit 开发前先 pull**
   ```bash
   git pull origin main
   ```

2. **只在 Cursor 编辑 schema.ts**
   - Cursor: 负责代码开发和 schema 定义
   - Replit: 负责部署和运行迁移

3. **使用分支进行大改动**
   ```bash
   git checkout -b feature/my-changes
   # 开发...
   # 在 GitHub 创建 PR
   ```

---

**需要帮助？** 如果遇到其他问题，发送错误信息给 Cursor AI！

