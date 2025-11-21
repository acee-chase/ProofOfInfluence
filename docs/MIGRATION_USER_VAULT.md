# UserVault & TestRuns 数据库迁移指南

## 问题

如果 `npm run db:push` 遇到连接错误（如 `57P01: terminating connection due to administrator command`），可以使用以下方法：

## 方法 1: 使用 SQL 脚本（推荐）

直接执行 SQL 迁移脚本：

```bash
# 使用 psql
psql $DATABASE_URL -f scripts/migrate-user-vault-tables.sql

# 或使用 Neon Console
# 1. 登录 Neon Console
# 2. 选择你的数据库
# 3. 在 SQL Editor 中粘贴 scripts/migrate-user-vault-tables.sql 的内容
# 4. 执行
```

## 方法 2: 重试 drizzle-kit push

有时连接问题可能是暂时的，可以重试：

```bash
npm run db:push
```

如果仍然失败，检查：
- `DATABASE_URL` 是否正确
- 数据库是否可访问
- 网络连接是否稳定

## 方法 3: 使用 Neon Pooled Connection

如果使用 Neon Serverless，尝试使用 Pooled Connection URL：

1. 在 Neon Console 中找到你的数据库
2. 复制 **Pooled Connection** URL（不是 Direct Connection）
3. 更新 `.env` 中的 `DATABASE_URL`

Pooled Connection URL 格式类似：
```
postgresql://user:password@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require
```

## 验证迁移

迁移成功后，可以验证表是否创建：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_vaults', 'vault_wallets', 'agents', 'vault_agent_permissions', 'test_runs', 'test_steps');

-- 应该返回 6 行
```

## 回滚（如果需要）

如果需要删除这些表：

```sql
DROP TABLE IF EXISTS test_steps CASCADE;
DROP TABLE IF EXISTS test_runs CASCADE;
DROP TABLE IF EXISTS vault_agent_permissions CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS vault_wallets CASCADE;
DROP TABLE IF EXISTS user_vaults CASCADE;
```

## 注意事项

- 迁移脚本使用 `CREATE TABLE IF NOT EXISTS`，可以安全地多次运行
- 索引也会自动创建（如果不存在）
- 默认的 `immortality-ai` agent 会自动创建
