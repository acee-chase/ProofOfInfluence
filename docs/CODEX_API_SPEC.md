# ProjectX Backend API 规范文档
## 给 Codex 的开发指令

**项目名称**: ACEE ProjectX  
**版本**: v0.2.0  
**更新日期**: 2025-11-09  
**目标**: 后端 API 开发 - Market、Reserve Pool、Merchant 三大模块

---

## 🎯 总体架构

### 技术栈要求
- **后端框架**: Node.js + Express (或 NestJS)
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM (优先) 或 Prisma
- **认证**: JWT + RBAC (role: user/merchant/admin)
- **日志**: 结构化日志 (Winston/Pino)
- **测试**: Jest (单测覆盖率 ≥ 70%)

### 通用要求
- ✅ 所有 POST 请求支持幂等性 (idempotencyKey)
- ✅ RESTful 风格
- ✅ 返回格式：JSON
- ✅ 错误格式：`{ message: string, code?: string }`
- ✅ 所有敏感操作记录日志 (userId, orderId, action, result)
- ✅ 速率限制：100 req/min per IP

---

## 📦 模块 A: Market API（优先级 1）

### **分支名称**: `feat/market-backend`

### **数据表设计**

#### **market_orders** 表
```sql
CREATE TABLE market_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,           -- 用户ID（来自认证）
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  token_in VARCHAR(50) NOT NULL,            -- 输入代币（如 USDC）
  token_out VARCHAR(50) NOT NULL,           -- 输出代币（如 POI）
  amount_in DECIMAL(20, 8) NOT NULL,        -- 输入金额
  amount_out DECIMAL(20, 8),                -- 输出金额（成交后填写）
  fee_bps INTEGER DEFAULT 0,                -- 手续费 (基点 1bps=0.01%)
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'FILLED', 'PARTIAL', 'CANCELED', 'FAILED')),
  tx_ref VARCHAR(255),                      -- 交易哈希/外部引用
  route JSONB,                              -- 路由信息（Maker/Taker/RFQ）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_market_orders_user_id ON market_orders(user_id);
CREATE INDEX idx_market_orders_status ON market_orders(status);
CREATE INDEX idx_market_orders_created_at ON market_orders(created_at DESC);
```

#### **market_trades** 表
```sql
CREATE TABLE market_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES market_orders(id),
  price DECIMAL(20, 8) NOT NULL,            -- 成交价格
  amount DECIMAL(20, 8) NOT NULL,           -- 成交数量
  route VARCHAR(50),                        -- 路由来源（internal/maker/taker）
  tx_ref VARCHAR(255),                      -- 链上交易哈希
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_market_trades_order_id ON market_trades(order_id);
```

---

### **API 端点**

#### **1. POST /api/market/orders** - 创建订单

**请求体**:
```json
{
  "side": "buy",          // "buy" | "sell"
  "tokenIn": "USDC",
  "tokenOut": "POI",
  "amountIn": "100.00",
  "idempotencyKey": "uuid-v4"  // 幂等性
}
```

**响应**:
```json
{
  "id": "uuid",
  "status": "PENDING",
  "side": "buy",
  "tokenIn": "USDC",
  "tokenOut": "POI",
  "amountIn": "100.00",
  "feeBps": 10,
  "estimatedAmountOut": "98.50",
  "createdAt": "2025-11-09T10:00:00Z"
}
```

**逻辑**:
1. 验证用户认证 (JWT)
2. 验证余额充足
3. 计算 feeBps（根据用户等级）
4. 创建订单记录（状态 PENDING）
5. 触发撮合引擎（异步）
6. 返回订单信息

---

#### **2. GET /api/market/orders** - 查询我的订单

**查询参数**:
- `status` (可选): PENDING | FILLED | CANCELED
- `limit` (默认 20): 分页数量
- `offset` (默认 0): 分页偏移

**响应**:
```json
{
  "orders": [
    {
      "id": "uuid",
      "side": "buy",
      "tokenIn": "USDC",
      "tokenOut": "POI",
      "amountIn": "100.00",
      "amountOut": "98.50",
      "status": "FILLED",
      "createdAt": "2025-11-09T10:00:00Z"
    }
  ],
  "total": 42,
  "hasMore": true
}
```

---

#### **3. GET /api/market/orders/:id** - 获取订单详情

**响应**:
```json
{
  "id": "uuid",
  "side": "buy",
  "tokenIn": "USDC",
  "tokenOut": "POI",
  "amountIn": "100.00",
  "amountOut": "98.50",
  "feeBps": 10,
  "status": "FILLED",
  "txRef": "0x...",
  "route": {
    "type": "maker",
    "exchange": "coinbase"
  },
  "trades": [
    {
      "id": "uuid",
      "price": "0.985",
      "amount": "100.00",
      "createdAt": "2025-11-09T10:01:00Z"
    }
  ],
  "createdAt": "2025-11-09T10:00:00Z",
  "updatedAt": "2025-11-09T10:01:00Z"
}
```

---

#### **4. PUT /api/market/orders/:id** - 更新订单（仅 PENDING 可改）

**请求体**:
```json
{
  "amountIn": "150.00"  // 修改金额
}
```

**响应**:
```json
{
  "id": "uuid",
  "status": "PENDING",
  "amountIn": "150.00",
  "updatedAt": "2025-11-09T10:05:00Z"
}
```

**权限**: 仅订单所有者，且状态为 PENDING

---

#### **5. DELETE /api/market/orders/:id** - 取消订单

**响应**:
```json
{
  "id": "uuid",
  "status": "CANCELED",
  "canceledAt": "2025-11-09T10:10:00Z"
}
```

**权限**: 仅订单所有者，且状态为 PENDING

---

#### **6. GET /api/market/orderbook** - 获取订单簿

**查询参数**:
- `pair`: USDC-POI (必需)

**响应**:
```json
{
  "pair": "USDC-POI",
  "bids": [
    { "price": "0.990", "amount": "1000.00" },
    { "price": "0.985", "amount": "2000.00" }
  ],
  "asks": [
    { "price": "1.010", "amount": "1500.00" },
    { "price": "1.015", "amount": "3000.00" }
  ],
  "updatedAt": "2025-11-09T10:15:00Z"
}
```

---

#### **7. GET /api/market/trades** - 获取最近交易

**查询参数**:
- `pair`: USDC-POI (必需)
- `limit` (默认 50): 最多返回数量

**响应**:
```json
{
  "trades": [
    {
      "price": "0.990",
      "amount": "100.00",
      "side": "buy",
      "timestamp": "2025-11-09T10:14:00Z"
    }
  ]
}
```

---

#### **8. GET /api/market/stats** - 获取市场统计

**查询参数**:
- `pair`: USDC-POI (必需)

**响应**:
```json
{
  "pair": "USDC-POI",
  "price": "0.995",
  "change24h": "+2.5%",
  "volume24h": "125000.00",
  "high24h": "1.020",
  "low24h": "0.980",
  "tvl": "500000.00"
}
```

---

### **验收标准**

1. ✅ 前端 `client/src/pages/Market.tsx` 能成功调用所有 API
2. ✅ 订单创建、查询、更新、取消流程完整
3. ✅ 幂等性测试通过（重复 POST 不创建多个订单）
4. ✅ 权限验证：用户只能操作自己的订单
5. ✅ 单元测试覆盖率 ≥ 70%

---

## 💰 模块 B: Reserve Pool API（优先级 3）

### **分支名称**: `feat/reserve-pool-api`

### **数据表设计**

#### **fees_ledger** 表
```sql
CREATE TABLE fees_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES market_orders(id),  -- 关联订单
  token VARCHAR(50) NOT NULL,                   -- 代币类型 (USDC/POI)
  amount DECIMAL(20, 8) NOT NULL,               -- 手续费金额
  source VARCHAR(50) NOT NULL,                  -- 来源 (market/swap/aggregate)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fees_ledger_created_at ON fees_ledger(created_at DESC);
CREATE INDEX idx_fees_ledger_token ON fees_ledger(token);
```

#### **reserve_balances** 表
```sql
CREATE TABLE reserve_balances (
  id SERIAL PRIMARY KEY,
  asset VARCHAR(50) UNIQUE NOT NULL,            -- USDC/POI/ETH
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **reserve_actions** 表
```sql
CREATE TABLE reserve_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('buyback', 'withdraw', 'rebalance')),
  payload JSONB NOT NULL,                       -- 操作详情
  result JSONB,                                 -- 执行结果
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP
);

CREATE INDEX idx_reserve_actions_type ON reserve_actions(type);
CREATE INDEX idx_reserve_actions_created_at ON reserve_actions(created_at DESC);
```

---

### **API 端点**

#### **1. GET /api/reserve-pool** - 获取资金池状态

**响应**:
```json
{
  "balances": {
    "USDC": "50000.00",
    "POI": "10000.00"
  },
  "totalFees7d": "1250.00",
  "totalFees30d": "5800.00",
  "totalBuyback": "25000.00",
  "lastBuybackDate": "2025-11-08T00:00:00Z",
  "nextBuybackScheduled": "2025-11-10T00:00:00Z"
}
```

---

#### **2. GET /api/reserve-pool/history** - 获取历史数据

**查询参数**:
- `range`: 7d | 30d | 90d (默认 30d)

**响应**:
```json
{
  "range": "30d",
  "data": [
    {
      "date": "2025-11-01",
      "fees": 180.50,
      "buyback": 120.30
    },
    {
      "date": "2025-11-02",
      "fees": 220.80,
      "buyback": 150.60
    }
  ]
}
```

---

#### **3. POST /api/reserve-pool/buyback** - 触发 $POI 回购

**请求体**:
```json
{
  "amountUSDC": "1000.00",  // 使用的 USDC 金额
  "minPOI": "950.00"        // 最少接受的 POI 数量 (滑点保护)
}
```

**响应**:
```json
{
  "actionId": "uuid",
  "status": "PENDING",
  "amountUSDC": "1000.00",
  "estimatedPOI": "980.00",
  "createdAt": "2025-11-09T10:00:00Z"
}
```

**权限**: 仅 admin 角色  
**逻辑**:
1. 检查 USDC 余额充足
2. 调用聚合器（UniswapX/0x）获取最佳价格
3. 执行兑换 USDC → POI
4. 记录 reserve_actions
5. 更新 reserve_balances
6. 分配 POI：50% 销毁、30% 分红、20% 生态基金

---

#### **4. POST /api/reserve-pool/withdraw** - 提取手续费

**请求体**:
```json
{
  "amount": "5000.00",
  "asset": "USDC",
  "to": "0x..."  // 目标地址
}
```

**响应**:
```json
{
  "actionId": "uuid",
  "status": "PENDING",
  "txRef": "0x...",
  "createdAt": "2025-11-09T10:00:00Z"
}
```

**权限**: 仅 admin 角色

---

#### **5. GET /api/reserve-pool/analytics** - 获取分析数据

**响应**:
```json
{
  "avgMonthlyFees": 2250.00,
  "avgBuybackRatio": 0.68,  // 68%
  "totalFeesAllTime": 125000.00,
  "totalBuybackAllTime": 85000.00
}
```

---

#### **6. GET /api/reserve-pool/activities** - 获取最近活动

**响应**:
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "buyback",
      "status": "SUCCESS",
      "details": {
        "amountUSDC": "1000.00",
        "amountPOI": "980.00"
      },
      "createdAt": "2025-11-09T08:00:00Z"
    }
  ]
}
```

---

### **定时任务**

#### **Fee Capture Job**
- **频率**: 每分钟
- **逻辑**: 监听 `FeeCaptured` 事件，写入 `fees_ledger`

#### **Buyback Cron**
- **频率**: 每天 00:00 UTC
- **逻辑**: 
  1. 检查 USDC 余额 > 阈值（如 $10,000）
  2. 触发回购
  3. 分配 POI

---

### **验收标准**

1. ✅ 前端 `client/src/components/ReservePoolPanel.tsx` 能拉取真实数据
2. ✅ 图表显示 7/30/90 天手续费和回购曲线
3. ✅ Admin 能成功执行回购和提取
4. ✅ Fee Capture Job 正常运行
5. ✅ 单元测试覆盖率 ≥ 70%

---

## 🏪 模块 C: Merchant API（优先级 5）

### **分支名称**: `feat/merchant-api`

### **数据表设计**

#### **products** 表
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(255) NOT NULL,           -- 商家 ID
  title VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDC',
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  media JSONB,                                 -- 图片/视频 URLs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_status ON products(status);
```

#### **merchant_orders** 表
```sql
CREATE TABLE merchant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  merchant_id VARCHAR(255) NOT NULL,
  buyer_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  fee DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'REFUNDED', 'CANCELED')),
  tx_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merchant_orders_merchant_id ON merchant_orders(merchant_id);
CREATE INDEX idx_merchant_orders_status ON merchant_orders(status);
```

#### **tax_reports** 表
```sql
CREATE TABLE tax_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_sales DECIMAL(12, 2) NOT NULL,
  platform_fees DECIMAL(12, 2) NOT NULL,
  net_amount DECIMAL(12, 2) NOT NULL,
  taxable_amount DECIMAL(12, 2),
  file_url VARCHAR(500),                       -- CSV/PDF 下载链接
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tax_reports_merchant_id ON tax_reports(merchant_id);
```

---

### **API 端点**

#### **商品管理**

**1. GET /api/merchant/products** - 获取商品列表
**2. POST /api/merchant/products** - 创建商品
**3. PUT /api/merchant/products/:id** - 更新商品价格
**4. DELETE /api/merchant/products/:id** - 删除商品

#### **订单管理**

**5. GET /api/merchant/orders** - 获取订单列表
**6. GET /api/merchant/orders/:id** - 获取订单详情
**7. PUT /api/merchant/orders/:id** - 更新订单状态

#### **税务报表**

**8. GET /api/merchant/tax-reports** - 获取报表列表
**9. POST /api/merchant/tax-reports** - 生成税务报表

**请求体**:
```json
{
  "periodStart": "2025-01-01",
  "periodEnd": "2025-03-31"
}
```

**10. GET /api/merchant/tax-reports/:id/download** - 下载报表

#### **统计分析**

**11. GET /api/merchant/analytics** - 获取交易统计

**响应**:
```json
{
  "thisWeek": {
    "sales": "5000.00",
    "orders": 42,
    "fees": "150.00"
  },
  "thisMonth": {
    "sales": "18500.00",
    "orders": 156,
    "fees": "555.00"
  }
}
```

---

### **验收标准**

1. ✅ 商家能创建/编辑/删除商品
2. ✅ 商家能查看和管理订单
3. ✅ 税务报表能生成 CSV/PDF 并下载
4. ✅ 权限验证：商家只能看到自己的数据
5. ✅ 单元测试覆盖率 ≥ 70%

---

## 🔐 认证与权限

### JWT Token 格式
```json
{
  "userId": "uuid",
  "role": "user",  // "user" | "merchant" | "admin"
  "exp": 1699999999
}
```

### RBAC 权限矩阵

| API Endpoint | user | merchant | admin |
|--------------|------|----------|-------|
| Market API | ✅ | ✅ | ✅ |
| Reserve Pool (read) | ❌ | ❌ | ✅ |
| Reserve Pool (write) | ❌ | ❌ | ✅ |
| Merchant API | ❌ | ✅ (own data) | ✅ |

---

## 📝 开发流程

### 1. 创建分支
```bash
git checkout -b feat/market-backend
```

### 2. 数据库迁移
```bash
# 使用 Drizzle
npm run db:generate
npm run db:push
```

### 3. 实现 API
- 遵循 RESTful 规范
- 添加单元测试
- 记录结构化日志

### 4. 测试
```bash
npm test
npm run test:cov  # 检查覆盖率
```

### 5. 创建 PR
- 标题：`feat: implement Market backend API`
- 描述：列出所有实现的端点和功能
- 附上测试截图

---

## 📊 监控与日志

### 结构化日志格式
```json
{
  "timestamp": "2025-11-09T10:00:00Z",
  "level": "info",
  "service": "market-api",
  "userId": "uuid",
  "action": "create_order",
  "orderId": "uuid",
  "result": "success",
  "duration": 125
}
```

### 关键指标
- API 响应时间 (p50, p95, p99)
- 错误率
- 订单成功率
- 手续费归集率

---

## 🚀 部署说明

- **环境**: 部署到 Replit（由 Replit AI 执行）
- **密钥**: 所有敏感信息存储在 Replit Secrets
- **数据库**: Neon Postgres (连接字符串在 Secrets)
- **端口**: 使用环境变量 `PORT`

---

## 📞 联系与协作

- **前端集成**: 与 Cursor 协调接口字段
- **问题反馈**: 在 PR 中 @mention 相关人员
- **紧急问题**: 查看 GitHub Issues

---

**祝开发顺利！🎉**

