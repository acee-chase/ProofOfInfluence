# AgentKit 到 Ethers.js 迁移说明

## 概述

我们已经从 Coinbase CDP AgentKit 迁移到使用 ethers.js 钱包客户端。这个迁移解决了 CDP AgentKit 每次初始化都创建新钱包的问题。

## 问题背景

### 原问题
- CDP AgentKit 的 `CdpWalletProvider.configureWithWallet()` 每次调用都会创建新的钱包地址
- 导致无法固定钱包地址，每次初始化都不同
- 无法为合约角色授予稳定的钱包地址

### 解决方案
- 使用 ethers.js 从固定私钥创建钱包
- 钱包地址由私钥确定，每次初始化都相同
- 完全兼容现有的 AgentKit 接口

## 变更内容

### 1. 新增文件

- `server/agentkit/walletClient.ts` - 新的钱包客户端实现
  - 使用 ethers.js 从私钥创建钱包
  - 提供 AgentKit 兼容接口

### 2. 修改文件

- `server/agentkit/agentkitClient.ts` - 更新为使用新的 walletClient
  - 移除了 CDP AgentKit 依赖
  - 保持相同的接口，确保向后兼容

### 3. 新增脚本

- `scripts/get-wallet-address.cjs` - 从私钥获取钱包地址
  - 替代原来的 `get-agentkit-wallet-address.cjs`
  - 使用 `npm run get:wallet-address` 运行

## 环境变量配置

### 必需的环境变量

设置以下环境变量之一（按优先级）：

```env
# 推荐：专门用于 AgentKit 操作的钱包私钥
AGENTKIT_PRIVATE_KEY=0x...

# 或使用现有的部署者私钥
PRIVATE_KEY=0x...

# 或
DEPLOYER_PRIVATE_KEY=0x...
```

### 不再需要的环境变量

以下 CDP AgentKit 相关的环境变量不再需要：

```env
# ❌ 不再需要
CDP_API_KEY_NAME=...
CDP_API_KEY_PRIVATE_KEY=...
CDP_WALLET_ADDRESS=...
```

## 迁移步骤

### 1. 获取钱包地址

```bash
npm run get:wallet-address
```

这会显示钱包地址，确保该地址被授予必要的合约角色。

### 2. 授予合约角色

确保钱包地址被授予以下角色：

- `ImmortalityBadge`: `MINTER_ROLE`
- `AchievementBadges`: `MINTER_ROLE`
- 其他需要的角色

```bash
npm run configure:badge-v2-roles
```

### 3. 更新环境变量

在 Replit Secrets 或 Render Environment Variables 中：

1. 移除 CDP 相关变量（如果存在）
2. 确保设置了 `AGENTKIT_PRIVATE_KEY`、`PRIVATE_KEY` 或 `DEPLOYER_PRIVATE_KEY`

### 4. 重启服务

重启后端服务以使新配置生效。

## 兼容性

### 代码兼容性

✅ **完全兼容** - 所有使用 `getAgentKitContext()` 的代码无需修改：

- `server/agentkit/badge.ts`
- `server/agentkit/achievementBadges.ts`
- `server/agentkit/tge.ts`
- `server/agentkit/staking.ts`
- `server/agentkit/erc20.ts`
- `server/routes/agentkit.ts`
- `server/services/contracts.ts`

### API 兼容性

✅ **完全兼容** - 所有 API 端点行为保持不变：

- `/api/agentkit/wallet` - 获取钱包信息
- `/api/agentkit/roles` - 获取角色状态
- `/api/agentkit/test` - 测试连接
- `/api/agentkit/configure-roles` - 配置角色

## 优势

1. ✅ **固定钱包地址** - 每次初始化都使用相同的地址
2. ✅ **更可控** - 不依赖 CDP 服务
3. ✅ **更成熟** - ethers.js 是成熟的库
4. ✅ **向后兼容** - 现有代码无需修改
5. ✅ **更简单** - 不需要 CDP API 密钥

## 测试

迁移后，请测试以下功能：

1. ✅ 获取钱包信息：`GET /api/agentkit/wallet`
2. ✅ 检查角色状态：`GET /api/agentkit/roles`
3. ✅ 铸造徽章：`POST /api/immortality/actions/mint-badge`
4. ✅ 其他 AgentKit 操作

## 回滚（如果需要）

如果需要回滚到 CDP AgentKit：

1. 恢复 `server/agentkit/agentkitClient.ts` 到之前的版本
2. 恢复 CDP 环境变量
3. 重新安装 `@coinbase/agentkit` 依赖

## 常见问题

### Q: 钱包地址会变化吗？

A: 不会。钱包地址由私钥确定，只要私钥不变，地址就不会变。

### Q: 可以使用现有的部署者钱包吗？

A: 可以。设置 `PRIVATE_KEY` 或 `DEPLOYER_PRIVATE_KEY` 即可。

### Q: 需要重新授予角色吗？

A: 如果使用新的私钥，需要为新地址授予角色。如果使用现有的部署者私钥，可能已经有角色了。

### Q: CDP AgentKit 依赖还需要吗？

A: 不需要。但为了向后兼容，`package.json` 中可能还保留依赖，可以安全移除。

## 总结

这次迁移解决了钱包地址不稳定的问题，使系统更加可靠和可控。所有现有功能保持不变，无需修改业务代码。

