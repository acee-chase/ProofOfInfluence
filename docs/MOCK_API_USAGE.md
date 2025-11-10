# Mock API 使用指南

## 🎯 什么是 Mock API？

Mock API 是模拟后端接口的前端实现，用于：
- ✅ **独立开发**: 前端无需等待后端，可独立开发和测试
- ✅ **快速迭代**: 无需启动后端服务器，开发效率更高
- ✅ **持续集成**: 自动化测试不依赖真实 API
- ✅ **演示 Demo**: 无需数据库即可展示完整功能

---

## 🏗️ 架构设计

```
client/src/lib/
├── api/
│   ├── index.ts          # 环境切换入口（根据 VITE_USE_MOCK_API）
│   ├── types.ts          # 类型定义（与 CODEX_API_SPEC.md 对齐）
│   ├── market.ts         # 真实 Market API（等待 Codex）
│   ├── reserve.ts        # 真实 Reserve API（等待 Codex）
│   └── merchant.ts       # 真实 Merchant API（等待 Codex）
└── mocks/
    ├── marketMock.ts     # Market Mock API (8个端点)
    ├── reserveMock.ts    # Reserve Pool Mock API (6个端点)
    └── merchantMock.ts   # Merchant Mock API (11个端点)
```

---

## 🔧 如何使用

### 1. 启用 Mock API（默认开发环境）

创建或编辑 `.env.development`:

```bash
# 使用 Mock API
VITE_USE_MOCK_API=true
```

### 2. 切换到真实 API

创建或编辑 `.env.production`:

```bash
# 使用真实 Codex API
VITE_USE_MOCK_API=false
```

### 3. 在组件中使用

**统一导入**（自动根据环境选择）:

```typescript
import { marketApi, reserveApi, merchantApi } from '@/lib/api';

// 使用方式相同，底层自动切换 Mock/Real
const { data } = useQuery({
  queryKey: ['market-stats'],
  queryFn: () => marketApi.getStats('USDC-POI'),
});
```

### 4. 运行项目

```bash
# 开发环境（自动使用 Mock）
npm run dev

# 生产环境（使用真实 API）
npm run build
npm run preview
```

---

## 📦 Mock API 功能列表

### Market Mock API (8个端点)

| 方法 | 端点 | 功能 | 状态 |
|------|------|------|------|
| POST | /api/market/orders | 创建订单 | ✅ |
| GET | /api/market/orders | 查询订单列表 | ✅ |
| GET | /api/market/orders/:id | 获取订单详情 | ✅ |
| PUT | /api/market/orders/:id | 更新订单 | ✅ |
| DELETE | /api/market/orders/:id | 取消订单 | ✅ |
| GET | /api/market/orderbook | 获取订单簿 | ✅ |
| GET | /api/market/trades | 获取交易历史 | ✅ |
| GET | /api/market/stats | 获取市场统计 | ✅ |

**特性**:
- 订单自动从 PENDING → FILLED (3秒延迟)
- 动态价格波动（±0.01）
- 20+ 条模拟交易记录

### Reserve Pool Mock API (6个端点)

| 方法 | 端点 | 功能 | 状态 |
|------|------|------|------|
| GET | /api/reserve-pool | 获取资金池状态 | ✅ |
| GET | /api/reserve-pool/history | 获取历史数据 | ✅ |
| POST | /api/reserve-pool/buyback | 执行回购 | ✅ |
| POST | /api/reserve-pool/withdraw | 提取手续费 | ✅ |
| GET | /api/reserve-pool/analytics | 获取分析数据 | ✅ |
| GET | /api/reserve-pool/activities | 获取最近活动 | ✅ |

**特性**:
- 支持 7/30/90 天历史数据
- 回购和提取自动更新余额
- 活动记录实时追踪

### Merchant Mock API (11个端点)

| 方法 | 端点 | 功能 | 状态 |
|------|------|------|------|
| GET | /api/merchant/products | 获取商品列表 | ✅ |
| POST | /api/merchant/products | 创建商品 | ✅ |
| PUT | /api/merchant/products/:id | 更新商品 | ✅ |
| DELETE | /api/merchant/products/:id | 删除商品 | ✅ |
| GET | /api/merchant/orders | 获取订单列表 | ✅ |
| GET | /api/merchant/orders/:id | 获取订单详情 | ✅ |
| PUT | /api/merchant/orders/:id | 更新订单状态 | ✅ |
| GET | /api/merchant/tax-reports | 获取报表列表 | ✅ |
| POST | /api/merchant/tax-reports | 生成税务报表 | ✅ |
| GET | /api/merchant/tax-reports/:id/download | 下载报表 | ✅ |
| GET | /api/merchant/analytics | 获取统计分析 ✅ |

**特性**:
- 完整 CRUD 操作
- 税务报表自动计算
- 周/月销售统计

---

## 🔄 从 Mock 切换到真实 API

当 Codex 完成后端开发后：

### 步骤 1: 更新真实 API 实现

编辑 `client/src/lib/api/market.ts`（已有占位代码）:

```typescript
export const realMarketApi: MarketApiInterface = {
  async createOrder(data) {
    const res = await fetch('/api/market/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },
  // ... 其他方法已实现
};
```

### 步骤 2: 切换环境变量

```bash
# .env.production
VITE_USE_MOCK_API=false
```

### 步骤 3: 测试

```bash
npm run build
npm run preview
```

### 步骤 4: 对比测试

```bash
# Mock 环境
VITE_USE_MOCK_API=true npm run dev

# Real 环境
VITE_USE_MOCK_API=false npm run dev
```

---

## 🧪 测试建议

### 单元测试（保留 Mock）

```typescript
// Market.test.tsx
import { mockMarketApi } from '@/lib/mocks/marketMock';

test('should create order', async () => {
  const order = await mockMarketApi.createOrder({
    side: 'buy',
    tokenIn: 'USDC',
    tokenOut: 'POI',
    amountIn: '100',
  });
  
  expect(order.status).toBe('PENDING');
});
```

### E2E 测试（使用 Mock）

```typescript
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    'X-Force-Mock': 'true',  // 强制使用 Mock
  },
},
```

---

## 📝 Mock 数据说明

### Market Mock
- **初始订单**: 4 条（2 FILLED, 1 PENDING, 1 CANCELED）
- **订单簿**: 5档 Bids + 5档 Asks
- **价格范围**: $0.980 - $1.030
- **交易历史**: 动态生成（最多 50 条）

### Reserve Pool Mock
- **USDC 余额**: ~$50,000（随手续费动态变化）
- **POI 余额**: ~10,000 POI
- **历史数据**: 自动生成 7/30/90 天
- **活动记录**: 3 条初始记录

### Merchant Mock
- **初始商品**: 2 个
- **初始订单**: 3 个（1 COMPLETED, 1 PAID, 1 PENDING）
- **税务报表**: 1 份 Q1 报表

---

## 🐛 常见问题

### Q: Mock API 不生效？

**A**: 检查环境变量：
```bash
# 查看当前配置
console.log(import.meta.env.VITE_USE_MOCK_API);

# 应该是 'true'
```

### Q: 数据不刷新？

**A**: Mock 有自动刷新间隔：
- Market stats: 10秒
- Reserve pool: 10秒
- Orders: 5秒

### Q: 如何添加更多 Mock 数据？

**A**: 编辑对应的 Mock 文件：
```typescript
// client/src/lib/mocks/marketMock.ts
let mockOrders: MarketOrder[] = [
  // 添加更多订单
  { id: '5', ... },
];
```

### Q: Mock API 支持哪些操作？

**A**: 支持完整 CRUD：
- ✅ Create: 添加到内存数组
- ✅ Read: 从内存读取
- ✅ Update: 修改内存数据
- ✅ Delete: 从数组移除

数据在页面刷新后重置。

---

## 🚀 下一步

1. **创建 PR**: 访问 [GitHub PR 页面](https://github.com/acee-chase/ProofOfInfluence/pull/new/feat/mock-api-integration)
2. **ChatGPT Review**: 按照 `PR_REVIEW_GUIDE_CHATGPT.md` 检查
3. **Merge 到 Main**: Review 通过后合并
4. **通知 Codex**: 提醒后端团队 Mock API 规范已就绪

---

**Mock API 不是临时代码，而是项目的长期资产！**

它将持续用于：
- 🧪 单元测试
- 🎭 Storybook
- 📸 截图/演示
- 🚧 开发环境
- 💾 灾备降级

**祝开发顺利！🎉**

