# 🚀 Replit 部署 POI Token 指南

代码已经推送到 GitHub！现在在 Replit 上部署。

## 📋 步骤 1: 在 Replit 中更新项目

### 如果已有 Replit 项目：

1. 打开你的 Replit 项目
2. 在 Replit Shell 中运行：
   ```bash
   git pull origin main
   ```
3. 安装新的依赖：
   ```bash
   npm install --legacy-peer-deps
   ```

### 如果是新的 Replit 项目：

1. 访问 [Replit](https://replit.com/)
2. 点击 **Create Repl**
3. 选择 **Import from GitHub**
4. 输入仓库 URL：
   ```
   https://github.com/chickendinner-chase/ProofOfInfluence
   ```
5. 点击 **Import**

---

## 📋 步骤 2: 配置 Replit Secrets

在 Replit 中：

1. 点击左侧栏的 **🔒 Secrets** (或 Tools → Secrets)

2. 添加以下 secrets：

### 必需的 Secrets：

| Key | Value | 说明 |
|-----|-------|------|
| `PRIVATE_KEY` | `your_wallet_private_key` | 你的钱包私钥（不要0x前缀） |
| `NETWORK` | `sepolia` | 部署网络 |

### 可选的 Secrets：

| Key | Value | 说明 |
|-----|-------|------|
| `WETH_AMOUNT` | `0.1` | 流动性池 ETH 数量 |
| `POI_AMOUNT` | `100000` | 流动性池 POI 数量 |

3. 点击 **Add new secret** 保存

---

## 📋 步骤 3: 获取测试币

在部署前，确保你的钱包有测试 ETH：

- **Sepolia 水龙头**: https://sepoliafaucet.com/
- 需要约 **0.2 ETH**（用于 gas 和流动性）

---

## 📋 步骤 4: 部署 POI Token

在 Replit Shell 中运行：

### 1. 编译合约
```bash
npm run compile
```

**预期输出**：
```
Compiled 8 Solidity files successfully
```

### 2. 部署代币和添加流动性
```bash
npm run deploy:all -- --network sepolia
```

**预期输出**：
```
🚀 开始部署 POI Token 并添加流动性...

📡 网络: sepolia (Chain ID: 11155111)
👛 部署者: 0xYourAddress
💰 余额: 0.5 ETH

📝 1. 部署 POI Token 合约...
✅ POI Token 已部署: 0xTokenAddress
   总供应量: 1000000000.0 POI

🌊 2. 准备添加 Uniswap V2 流动性...
✅ 流动性已添加!

🎉 部署完成!
📍 POI Token: 0xTokenAddress
📍 流动性池: 0xPairAddress
```

---

## 📋 步骤 5: 验证部署

### 1. 查看部署记录
```bash
cat deployments/deployment-sepolia.json
```

### 2. 在区块浏览器查看
访问：
```
https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS
```

### 3. 在 Uniswap 查看流动性池
访问：
```
https://app.uniswap.org/pool/YOUR_PAIR_ADDRESS
```

---

## 🎯 部署成功后

### 保存重要信息：

1. **POI Token 地址**：`0x...`
2. **流动性池地址**：`0x...`
3. **交易哈希**：`0x...`

### 更新前端配置：

在 Replit Secrets 中添加：
```
POI_TOKEN_ADDRESS=0xYourTokenAddress
```

---

## 🔍 常见问题

### Q: 提示 "insufficient funds"？
**A:** 去水龙头获取更多测试 ETH

### Q: 编译失败？
**A:** 运行 `npm install --legacy-peer-deps` 重新安装依赖

### Q: 找不到 Secrets 入口？
**A:** 在 Replit 左侧栏找 🔒 图标，或 Tools → Secrets

### Q: 部署后想添加更多流动性？
**A:** 
```bash
# 设置代币地址
export POI_TOKEN_ADDRESS=0xYourTokenAddress
# 添加流动性
npm run deploy:liquidity
```

---

## 📚 相关文档

- **[POI_TOKEN_SETUP_COMPLETE.md](POI_TOKEN_SETUP_COMPLETE.md)** - 系统总览
- **[docs/QUICK_START_POI.md](docs/QUICK_START_POI.md)** - 快速开始
- **[docs/TOKEN_DEPLOYMENT.md](docs/TOKEN_DEPLOYMENT.md)** - 完整部署文档
- **[docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - 检查清单

---

## 🎉 准备就绪！

现在可以在 Replit 上部署你的 POI Token 了！

**下一步**：
1. 在 Replit 中配置 Secrets
2. 获取测试币
3. 运行 `npm run compile`
4. 运行 `npm run deploy:all -- --network sepolia`

**祝部署顺利！🚀**

