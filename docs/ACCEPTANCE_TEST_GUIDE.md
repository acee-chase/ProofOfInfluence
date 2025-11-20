# Immortality Playable Agent - 验收测试指南

## 快速验收清单

### ✅ 必须完成（No-Go 阈值）

1. **数据库迁移**
   ```bash
   npm run db:push
   ```
   - 确保所有新表已创建：`user_vaults`, `vault_wallets`, `agents`, `vault_agent_permissions`, `test_runs`, `test_steps`

2. **合约部署**
   - 部署 `ImmortalityBadgeV2.sol` 到 Base Sepolia
   - 配置环境变量：`IMMORTALITY_BADGE_ADDRESS=0x...`
   - 确保合约已配置：
     - `configureBadgeType(1, {enabled: true, transferable: false, uri: "..."})`
     - `setMintPrice(0)` (如果免费铸造)
     - `unpause()` (确保未暂停)

3. **环境变量配置**
   ```env
   OPENAI_API_KEY=sk-xxx
   IMMORTALITY_BADGE_ADDRESS=0x...
   RPC_URL=https://sepolia.base.org
   BASE_RPC_URL=https://sepolia.base.org
   CHAIN_ID=84532
   ```

### 🧪 验收测试步骤

#### 1. 测试授权接口

```bash
# 先运行一次场景以创建 vault，然后获取 vaultId
# 或者直接通过 API 创建 vault（如果实现了）

curl -X POST http://localhost:5000/api/vaults/<vaultId>/agents/grant \
  -H 'Content-Type: application/json' \
  -d '{
    "agentId": "immortality-ai",
    "scopes": ["memory.read", "memory.write", "chat.invoke", "badge.mint"],
    "constraints": {"maxMints": 1}
  }'
```

**期望响应**：
```json
{"success": true, "permissionId": "vap_..."}
```

#### 2. 测试 Chat API（验证 OpenAI）

```bash
curl -X POST http://localhost:5000/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=test' \
  -d '{"message": "Hello"}'
```

**期望响应**：
- ✅ 200 OK，返回 `{"reply": "...", ...}`
- ❌ 503 → `OPENAI_API_KEY` 未配置
- ❌ 401 → 需要认证（正常，但测试时可能需要 mock）

#### 3. 运行完整场景

```bash
curl -X POST http://localhost:5000/api/test-scenarios/run \
  -H 'Content-Type: application/json' \
  -H 'x-demo-user-id: demo-001' \
  -d '{
    "scenarioKey": "immortality-playable-agent",
    "params": {
      "chain": "base-sepolia",
      "memorySeed": ["I am immortal.", "My badge proves it.", "POI infra."],
      "chat": {
        "messages": [{"role": "user", "content": "你是谁？你记得什么？"}]
      },
      "mint": {
        "method": "mintSelf",
        "priceEth": "0"
      }
    }
  }'
```

**期望响应**：
```json
{
  "success": true,
  "runId": "run_...",
  "steps": [
    {"name": "allocate_vault_wallet", "status": "success", "output": {...}},
    {"name": "initialize_memories", "status": "success", "output": {"count": 3}},
    {"name": "ai_chat", "status": "success", "output": {"hits": [true]}},
    {"name": "mint_badge", "status": "success", "output": {"txHash": "0x..."}},
    {"name": "verify", "status": "success", "output": {"hasMinted": true, "balance": "1"}}
  ],
  "result": {
    "userId": "demo-001",
    "vaultId": "vault_...",
    "walletAddress": "0x...",
    "memoriesCreated": 3
  }
}
```

#### 4. 查询运行详情

```bash
curl http://localhost:5000/api/test-runs/<runId> | jq .
```

**关键检查点**：
- ✅ 所有步骤 `status: "success"`
- ✅ `ai_chat.output.results` 非空
- ✅ `mint_badge.output.txHash` 存在
- ✅ `verify.output.hasMinted: true`, `balance: "1"`
- ✅ 失败步骤有 `error.errorName`（不是 "unknown reason"）

### 🔍 错误解码验证

如果 `mint_badge` 失败，检查错误字段：

**✅ 正确（具名错误）**：
```json
{
  "error": {
    "code": "CONTRACT_REVERT",
    "message": "AlreadyMinted",
    "data": {
      "errorName": "AlreadyMinted",
      "errorArgs": ["0x..."]
    }
  }
}
```

**❌ 错误（未解码）**：
```json
{
  "error": {
    "code": "CONTRACT_REVERT",
    "message": "Execution reverted",
    "data": {}
  }
}
```

### 🐛 常见问题排查

#### 问题 1: 数据库连接被终止

**错误**：`terminating connection due to administrator command`

**解决方案**：
1. 检查 `DATABASE_URL` 是否正确
2. 检查数据库是否可访问（网络/防火墙）
3. 尝试增加连接超时：
   ```typescript
   // drizzle.config.ts
   export default defineConfig({
     // ... existing config
     dbCredentials: {
       url: process.env.DATABASE_URL,
       ssl: { rejectUnauthorized: false }, // 如果使用 SSL
     },
   });
   ```

#### 问题 2: 合约未部署

**错误**：`IMMORTALITY_BADGE_ADDRESS not configured`

**解决方案**：
1. 部署合约到 Base Sepolia
2. 设置环境变量：`IMMORTALITY_BADGE_ADDRESS=0x...`

#### 问题 3: OpenAI Key 未配置

**错误**：`OPENAI_API_KEY not configured`

**解决方案**：
1. 设置环境变量：`OPENAI_API_KEY=sk-xxx`
2. 重启服务器

#### 问题 4: 合约暂停

**错误**：`Pausable: paused`

**解决方案**：
```solidity
// 作为 owner 调用
contract.unpause();
```

#### 问题 5: 重复铸造

**错误**：`AlreadyMinted`

**解决方案**：
- 使用新的 demoUserId 或新的 vault 钱包
- 或使用 `mintFor` 方法（平台发行，不检查 hasMinted）

### 📊 验收通过标准

**Go（通过）** 必须满足：
- ✅ 所有 6 步均成功
- ✅ `ai_chat` 返回非空回复
- ✅ `mint_badge` 返回有效 `txHash`
- ✅ `verify` 显示 `hasMinted: true`, `balance: "1"`
- ✅ 失败步骤有具名 `errorName`
- ✅ 前端页面可运行

**No-Go（不通过）** 任意满足：
- ❌ 合约未部署
- ❌ OpenAI Key 未配置
- ❌ 仍出现 "unknown reason" 错误
- ❌ 步骤未持久化到数据库
- ❌ 权限校验缺失

### 🚀 快速验收脚本

使用提供的验收脚本：

```bash
chmod +x scripts/acceptance-test.sh
./scripts/acceptance-test.sh http://localhost:5000 demo-001
```

脚本会自动：
1. 检查 Chat API
2. 运行完整场景
3. 查询运行详情
4. 验证步骤完整性
