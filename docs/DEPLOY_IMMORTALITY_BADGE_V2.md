# ImmortalityBadgeV2 部署指南

## 概述

ImmortalityBadgeV2 是一个增强的 NFT Badge 合约，支持：
- 用户自主铸造（`mintSelf`）
- 平台代理铸造（`mintFor`）
- 可配置的 mint 价格
- 可暂停/恢复功能
- Badge 类型管理

## 前置条件

### 1. 环境变量配置

确保 `.env` 文件包含以下配置：

```env
# 部署者私钥（必需）
PRIVATE_KEY=0x...
# 或
DEPLOYER_PRIVATE_KEY=0x...

# 网络配置
NETWORK=base-sepolia  # 或 base（主网）
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# 或主网
BASE_RPC_URL=https://mainnet.base.org

# 合约配置（可选）
IMMORTALITY_BADGE_BASE_URI=https://api.proofofinfluence.com/badge/  # 可选
IMMORTALITY_BADGE_ADMIN=0x...  # 可选，默认使用部署者地址
IMMORTALITY_BADGE_MINT_PRICE=0  # 可选，默认 0（免费）
IMMORTALITY_BADGE_TRANSFERABLE=true  # 可选，默认 true
```

### 2. 部署者钱包要求

- 确保部署者钱包有足够的 ETH/Base ETH 支付 gas 费用
- Base Sepolia 测试网：建议至少 0.01 ETH
- Base 主网：建议至少 0.001 ETH

### 3. 编译合约

```bash
npm run compile
```

确保编译成功，artifact 文件位于：
```
artifacts/contracts/ImmortalityBadgeV2.sol/ImmortalityBadgeV2.json
```

## 部署步骤

### 方法 1：使用 npm 脚本（推荐）

```bash
npm run deploy:immortality-v2
```

这会使用 Hardhat 运行部署脚本到 Base Sepolia 测试网。

### 方法 2：直接运行脚本

```bash
node scripts/deploy-immortality-badge-v2-run.cjs
```

### 方法 3：使用 Hardhat 指定网络

```bash
# Base Sepolia 测试网
npx hardhat run scripts/deploy-immortality-badge-v2-run.cjs --network base-sepolia

# Base 主网
npx hardhat run scripts/deploy-immortality-badge-v2-run.cjs --network base
```

## 部署后配置

部署脚本会自动执行以下配置：

1. ✅ **配置 Badge Type 1**：启用 badge type 1（BADGE_TYPE_TEST）
2. ✅ **取消暂停**：如果合约处于暂停状态，会自动取消暂停

### 手动配置（如果需要）

如果自动配置失败，可以手动执行：

```javascript
// 连接到合约
const badge = await ethers.getContractAt("ImmortalityBadgeV2", CONTRACT_ADDRESS);

// 1. 配置 badge type 1
await badge.configureBadgeType(1, {
  enabled: true,
  transferable: true,  // 或 false（不可转让）
  uri: ""  // 或自定义 URI
});

// 2. 取消暂停（如果需要）
await badge.unpause();

// 3. 设置 mint 价格（如果需要收费）
await badge.setMintPrice(ethers.utils.parseEther("0.001"));  // 0.001 ETH

// 4. 设置 base URI（如果需要）
await badge.setBaseURI("https://api.proofofinfluence.com/badge/");
```

## 部署输出

部署成功后，脚本会输出：

```
✅ ImmortalityBadgeV2 deployed to 0x...
Contract Address: 0x...
Network: base-sepolia (Chain ID: 84532)
Transaction: 0x...
Block: 12345678

📝 Next Steps:
1. Add to .env file:
   IMMORTALITY_BADGE_ADDRESS=0x...
   VITE_IMMORTALITY_BADGE_ADDRESS=0x...
```

## 更新环境变量

部署完成后，将合约地址添加到 `.env` 文件：

```env
# Immortality Badge V2
IMMORTALITY_BADGE_ADDRESS=0x...
VITE_IMMORTALITY_BADGE_ADDRESS=0x...
```

然后重启服务器以使新配置生效。

## 验证部署

### 1. 检查合约代码

```bash
# 使用 cast（Foundry）
cast code 0x... --rpc-url https://sepolia.base.org

# 或使用区块浏览器
# Base Sepolia: https://sepolia.basescan.org/address/0x...
# Base Mainnet: https://basescan.org/address/0x...
```

### 2. 验证合约状态

```javascript
const badge = await ethers.getContractAt("ImmortalityBadgeV2", CONTRACT_ADDRESS);

// 检查基本状态
console.log("Name:", await badge.name());
console.log("Symbol:", await badge.symbol());
console.log("Mint Price:", ethers.utils.formatEther(await badge.mintPrice()));
console.log("Paused:", await badge.paused());

// 检查 badge type 1 配置
const badgeType1 = await badge.badgeTypes(1);
console.log("Badge Type 1:", {
  enabled: badgeType1.enabled,
  transferable: badgeType1.transferable,
  uri: badgeType1.uri
});
```

### 3. 测试铸造（测试网）

```bash
# 运行测试场景
curl -X POST http://localhost:5000/api/test-scenarios/run \
  -H 'Content-Type: application/json' \
  -H 'x-demo-user-id: demo-001' \
  -d '{
    "scenarioKey": "immortality-playable-agent",
    "params": {
      "chain": "base-sepolia",
      "mint": {"method": "mintSelf", "priceEth": "0"}
    }
  }'
```

## 部署记录

部署信息会自动保存到：
```
shared/contracts/immortality_badge_v2.json
```

包含：
- 合约地址
- ABI
- 网络信息
- 部署元数据

## 常见问题

### 问题 1: "Missing PRIVATE_KEY"

**解决方案**：
```env
# 在 .env 文件中添加
PRIVATE_KEY=0x...
```

### 问题 2: "Low balance"

**解决方案**：
- Base Sepolia：从 [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) 获取测试 ETH
- Base Mainnet：从交易所或其他钱包转账 ETH

### 问题 3: "Contract artifact not found"

**解决方案**：
```bash
npm run compile
```

### 问题 4: 部署后合约仍暂停

**解决方案**：
```javascript
const badge = await ethers.getContractAt("ImmortalityBadgeV2", CONTRACT_ADDRESS);
await badge.unpause();
```

### 问题 5: Badge type 1 未配置

**解决方案**：
```javascript
await badge.configureBadgeType(1, {
  enabled: true,
  transferable: true,
  uri: ""
});
```

## 安全注意事项

1. ⚠️ **私钥安全**：
   - 永远不要将私钥提交到 Git
   - 不要在代码中硬编码私钥
   - 使用环境变量或密钥管理服务

2. ⚠️ **部署验证**：
   - 部署后验证合约地址
   - 检查合约代码是否与源码一致
   - 在区块浏览器上验证合约

3. ⚠️ **权限管理**：
   - 确保 admin 地址安全
   - 考虑使用多签钱包作为 admin
   - 定期审查权限设置

## 相关文档

- [合约源代码](../contracts/ImmortalityBadgeV2.sol)
- [环境变量配置](./ENV_VARIABLES.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)

