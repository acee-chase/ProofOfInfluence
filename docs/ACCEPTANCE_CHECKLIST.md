# Immortality Playable Agent - 验收检查清单

## ✅ 已完成的改进（基于验收要求）

### 1. 错误解码增强 ✅

**文件**: `server/services/blockchainUtils.ts`

**改进内容**:
- ✅ 实现了 `decodeContractError()` 函数，支持多种错误数据格式
- ✅ 添加了 `callStatic` 预演（Step 1）
- ✅ 添加了 `estimateGas` 验证（Step 2）
- ✅ 实现了完整的错误解码流程，支持：
  - Custom errors (AlreadyMinted, InsufficientPayment, etc.)
  - Standard errors (Pausable: paused, AccessControl, etc.)
  - Fallback to error reason/message

**验证方法**:
```bash
# 如果 mint_badge 失败，检查返回的错误应包含 errorName
curl http://localhost:5000/api/test-runs/<runId> | jq '.steps[] | select(.name == "mint_badge") | .error'
```

**期望输出**:
```json
{
  "code": "CONTRACT_REVERT",
  "message": "AlreadyMinted",
  "data": {
    "errorName": "AlreadyMinted",
    "errorArgs": ["0x..."]
  }
}
```

### 2. 权限校验完整实现 ✅

**文件**: `server/services/testScenarioRunnerV2.ts`

**检查点**:
- ✅ `initialize_memories` 前：`assertAgentAllowed(vaultId, agentId, "memory.write")` (Line 153)
- ✅ `ai_chat` 前：`assertAgentAllowed(vaultId, agentId, "chat.invoke")` (Line 193)
- ✅ `mint_badge` 前：`assertAgentAllowed(vaultId, agentId, "badge.mint")` (Line 247)

**验证方法**:
- 查看代码，确认每个写操作前都有权限校验
- 如果权限不足，应抛出明确的错误

### 3. Verify 步骤链上验证 ✅

**文件**: `server/services/testScenarioRunnerV2.ts` (Line 341-404)

**实现内容**:
- ✅ 读取合约状态：`hasMinted(address)`
- ✅ 读取余额：`balanceOf(address)`
- ✅ 验证结果：`verified: hasMinted && balance > 0`
- ✅ 错误处理：捕获并记录验证失败

**验证方法**:
```bash
curl http://localhost:5000/api/test-runs/<runId> | jq '.steps[] | select(.name == "verify")'
```

**期望输出**:
```json
{
  "name": "verify",
  "status": "success",
  "output": {
    "owner": "0x...",
    "hasMinted": true,
    "balance": "1",
    "verified": true
  }
}
```

### 4. ABI 包含错误定义 ✅

**文件**: `server/services/testScenarioRunnerV2.ts` (Line 279-321)

**已添加的错误定义**:
- ✅ `AlreadyMinted(address)`
- ✅ `InsufficientPayment(uint256 required, uint256 provided)`
- ✅ `BadgeDisabled(uint256 badgeType)`
- ✅ `BadgeAlreadyClaimed(uint256 badgeType, address account)`

**作用**: 确保错误解码能正确识别合约自定义错误

### 5. 验收测试脚本 ✅

**文件**: `scripts/acceptance-test.sh`

**功能**:
- ✅ 自动测试 Chat API
- ✅ 运行完整场景
- ✅ 查询运行详情
- ✅ 验证步骤完整性

**使用方法**:
```bash
chmod +x scripts/acceptance-test.sh
./scripts/acceptance-test.sh http://localhost:5000 demo-001
```

### 6. 数据库配置优化 ✅

**文件**: `drizzle.config.ts`

**改进**:
- ✅ 添加了 SSL 配置支持
- ✅ 添加了 verbose 和 strict 模式
- ✅ 改进了错误提示

**注意**: 如果数据库连接仍然失败，可能需要：
1. 检查 `DATABASE_URL` 是否正确
2. 使用连接池 URL（如果使用 Neon Serverless）
3. 检查网络/防火墙设置

## 🔍 验收测试步骤

### 前置条件检查

1. **数据库迁移**
   ```bash
   npm run db:push
   ```
   - 确认所有表已创建：`user_vaults`, `vault_wallets`, `agents`, `vault_agent_permissions`, `test_runs`, `test_steps`

2. **环境变量配置**
   ```bash
   # 必须配置
   OPENAI_API_KEY=sk-xxx
   IMMORTALITY_BADGE_ADDRESS=0x...
   RPC_URL=https://sepolia.base.org
   BASE_RPC_URL=https://sepolia.base.org
   CHAIN_ID=84532
   ```

3. **合约部署状态**
   - ✅ 合约已部署到 Base Sepolia
   - ✅ 合约地址已写入 `IMMORTALITY_BADGE_ADDRESS`
   - ✅ 合约已配置：`unpause()`, `setMintPrice(0)` (如果免费)

### 测试步骤

#### Step 1: 测试授权接口

```bash
# 先运行场景创建 vault，然后获取 vaultId
# 或直接通过 API 创建（如果实现了）

curl -X POST http://localhost:5000/api/vaults/<vaultId>/agents/grant \
  -H 'Content-Type: application/json' \
  -d '{
    "agentId": "immortality-ai",
    "scopes": ["memory.read", "memory.write", "chat.invoke", "badge.mint"],
    "constraints": {"maxMints": 1}
  }'
```

**期望**: `{"success": true, "permissionId": "vap_..."}`

#### Step 2: 测试 Chat API

```bash
curl -X POST http://localhost:5000/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=test' \
  -d '{"message": "Hello"}'
```

**期望**: 200 OK，返回非空回复（或 503 如果未配置 OPENAI_API_KEY）

#### Step 3: 运行完整场景

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

**期望**: 
```json
{
  "success": true,
  "runId": "run_...",
  "steps": [...]
}
```

#### Step 4: 查询运行详情

```bash
curl http://localhost:5000/api/test-runs/<runId> | jq .
```

**关键检查点**:
- ✅ 所有步骤 `status: "success"`
- ✅ `ai_chat.output.results` 非空
- ✅ `mint_badge.output.txHash` 存在
- ✅ `verify.output.hasMinted: true`, `balance: "1"`
- ✅ 失败步骤有 `error.errorName`（不是 "unknown reason"）

## 🚨 常见问题排查

### 问题 1: 数据库连接被终止

**错误**: `terminating connection due to administrator command (57P01)`

**可能原因**:
1. 数据库服务器重启
2. 网络中断
3. 连接超时
4. 数据库凭据错误

**解决方案**:
1. 检查 `DATABASE_URL` 是否正确
2. 如果使用 Neon Serverless，尝试使用连接池 URL
3. 检查网络连接
4. 重试操作

### 问题 2: 合约未部署

**错误**: `IMMORTALITY_BADGE_ADDRESS not configured`

**解决方案**:
1. 部署 `ImmortalityBadgeV2.sol` 到 Base Sepolia
2. 设置环境变量：`IMMORTALITY_BADGE_ADDRESS=0x...`
3. 重启服务器

### 问题 3: OpenAI Key 未配置

**错误**: Chat API 返回 503

**解决方案**:
1. 设置环境变量：`OPENAI_API_KEY=sk-xxx`
2. 重启服务器

### 问题 4: 合约暂停

**错误**: `Pausable: paused`

**解决方案**:
```solidity
// 作为 owner 调用
contract.unpause();
```

### 问题 5: 重复铸造

**错误**: `AlreadyMinted`

**解决方案**:
- 使用新的 `demoUserId`
- 或使用 `mintFor` 方法（平台发行）

### 问题 6: 错误未解码

**错误**: `errorName` 为 `undefined` 或 `"Execution reverted"`

**检查**:
1. 确认 ABI 包含错误定义
2. 确认 `blockchainUtils.ts` 中的 `decodeContractError` 已实现
3. 检查错误数据格式是否匹配

## 📊 Go/No-Go 判定标准

### ✅ Go（通过）

必须满足：
- ✅ 所有 6 步均成功
- ✅ `ai_chat` 返回非空回复
- ✅ `mint_badge` 返回有效 `txHash`
- ✅ `verify` 显示 `hasMinted: true`, `balance: "1"`
- ✅ 失败步骤有具名 `errorName`（不是 "unknown reason"）
- ✅ 步骤持久化到数据库
- ✅ 权限校验在每个写操作前执行

### ❌ No-Go（不通过）

任意满足：
- ❌ 合约未部署或地址未配置
- ❌ OpenAI Key 未配置
- ❌ 仍出现 "unknown reason" 错误（错误解码未实现）
- ❌ 步骤未持久化到数据库
- ❌ 权限校验缺失
- ❌ 前端页面无法运行

## 📝 验收输出格式

验收完成后，请提供：

1. **场景运行响应**:
   ```json
   {
     "success": true,
     "runId": "run_...",
     "steps": [...]
   }
   ```

2. **运行详情**:
   ```json
   {
     "id": "run_...",
     "status": "success",
     "steps": [
       {"name": "allocate_vault_wallet", "status": "success", ...},
       {"name": "initialize_memories", "status": "success", ...},
       {"name": "ai_chat", "status": "success", ...},
       {"name": "mint_badge", "status": "success", ...},
       {"name": "verify", "status": "success", ...}
     ]
   }
   ```

3. **错误信息**（如果有失败）:
   ```json
   {
     "name": "mint_badge",
     "status": "failed",
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

## 🎯 下一步

1. 运行验收测试脚本
2. 检查所有步骤是否成功
3. 验证错误解码是否工作
4. 确认链上验证结果
5. 提供验收输出给团队
