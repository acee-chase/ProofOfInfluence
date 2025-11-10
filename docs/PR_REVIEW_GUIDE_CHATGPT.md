# PR Review Guide for ChatGPT

## 项目背景

**Repository**: ProofOfInfluence (acee-chase)  
**Branch**: `feat/mock-api-integration`  
**目标**: 为 Market、Reserve Pool、Merchant 三大模块实现 Mock API，等待 Codex 后端开发完成

---

## PR 信息

### PR #1: Market Module
**Commit**: `3758630` - feat: implement Market Mock API with 8 endpoints and integrate with Market.tsx

**文件变更**:
- ✅ `client/src/lib/api/types.ts` - API 类型定义
- ✅ `client/src/lib/api/index.ts` - 环境切换入口
- ✅ `client/src/lib/api/market.ts` - 真实 API 占位
- ✅ `client/src/lib/mocks/marketMock.ts` - Market Mock API (8个端点)
- ✅ `client/src/pages/Market.tsx` - 集成 Mock API

**功能清单**:
1. POST /api/market/orders - 创建订单 ✓
2. GET /api/market/orders - 查询订单列表 ✓
3. GET /api/market/orders/:id - 获取订单详情 ✓
4. PUT /api/market/orders/:id - 更新订单 ✓
5. DELETE /api/market/orders/:id - 取消订单 ✓
6. GET /api/market/orderbook - 获取订单簿 ✓
7. GET /api/market/trades - 获取交易历史 ✓
8. GET /api/market/stats - 获取市场统计 ✓

**验收标准**:
- [ ] 类型定义与 `docs/CODEX_API_SPEC.md` 完全对齐
- [ ] Market.tsx 无 TODO 注释
- [ ] 订单创建、查询、取消功能正常
- [ ] 实时数据刷新（5-10秒间隔）
- [ ] Toast 通知完整
- [ ] 无 TypeScript 错误
- [ ] 响应式布局正常

---

### PR #2: Reserve Pool Module
**Commit**: `cd5d0d4` - feat: implement Reserve Pool Mock API with 6 endpoints

**文件变更**:
- ✅ `client/src/lib/mocks/reserveMock.ts` - Reserve Pool Mock API (6个端点)
- ✅ `client/src/components/ReservePoolPanel.tsx` - 集成 Mock API

**功能清单**:
1. GET /api/reserve-pool - 获取资金池状态 ✓
2. GET /api/reserve-pool/history - 获取历史数据 ✓
3. POST /api/reserve-pool/buyback - 执行回购 ✓
4. POST /api/reserve-pool/withdraw - 提取手续费 ✓
5. GET /api/reserve-pool/analytics - 获取分析数据 ✓
6. GET /api/reserve-pool/activities - 获取最近活动 ✓

**验收标准**:
- [ ] 类型定义与 `docs/CODEX_API_SPEC.md` 对齐
- [ ] 7/30/90 天历史数据曲线正常
- [ ] 回购和提取按钮可用
- [ ] 活动记录显示详细信息
- [ ] 数据实时刷新
- [ ] Admin 权限检查（Mock 环境跳过）

---

### PR #3: Merchant Module
**Commit**: `3aca492` - feat: implement Merchant Mock API with 11 endpoints and MerchantDashboard

**文件变更**:
- ✅ `client/src/lib/mocks/merchantMock.ts` - Merchant Mock API (11个端点)
- ✅ `client/src/components/MerchantDashboard.tsx` - 商家后台组件
- ✅ `client/src/pages/Dashboard.tsx` - 集成 MerchantDashboard

**功能清单**:
1. GET /api/merchant/products - 获取商品列表 ✓
2. POST /api/merchant/products - 创建商品 ✓
3. PUT /api/merchant/products/:id - 更新商品 ✓
4. DELETE /api/merchant/products/:id - 删除商品 ✓
5. GET /api/merchant/orders - 获取订单列表 ✓
6. GET /api/merchant/orders/:id - 获取订单详情 ✓
7. PUT /api/merchant/orders/:id - 更新订单状态 ✓
8. GET /api/merchant/tax-reports - 获取报表列表 ✓
9. POST /api/merchant/tax-reports - 生成税务报表 ✓
10. GET /api/merchant/tax-reports/:id/download - 下载报表 ✓
11. GET /api/merchant/analytics - 获取统计分析 ✓

**验收标准**:
- [ ] 商品 CRUD 功能完整
- [ ] 订单状态流转正常
- [ ] 税务报表生成和下载
- [ ] 周/月统计数据准确
- [ ] 权限检查（仅商家可见自己数据）

---

## Review Checklist for ChatGPT

### 🔍 代码一致性检查

1. **接口对齐**:
   - [ ] 所有字段名与 `docs/CODEX_API_SPEC.md` 一致
   - [ ] 请求/响应格式匹配
   - [ ] 状态枚举值正确

2. **类型安全**:
   - [ ] 无 `any` 类型（除必要的 error handling）
   - [ ] Interface 完整定义
   - [ ] 类型导入正确

3. **错误处理**:
   - [ ] 所有 API 调用有 try-catch 或 onError
   - [ ] Toast 通知用户友好
   - [ ] Loading 状态完整

4. **代码质量**:
   - [ ] 遵循 `.cursorrules` 规范
   - [ ] 组件命名规范（PascalCase）
   - [ ] 无 console.log（除 debug）
   - [ ] 注释清晰（Mock 标记）

5. **可维护性**:
   - [ ] Mock API 独立文件
   - [ ] 易于替换为真实 API
   - [ ] 环境变量切换清晰

### 🎨 UI/UX 检查

1. **响应式设计**:
   - [ ] 移动端布局无溢出
   - [ ] 平板/桌面端布局合理

2. **交互体验**:
   - [ ] 按钮禁用状态清晰
   - [ ] Loading 动画流畅
   - [ ] 表单验证友好

3. **数据展示**:
   - [ ] 空状态提示清晰
   - [ ] 加载状态有 Skeleton
   - [ ] 错误状态有提示

### 🔒 安全与性能

1. **数据安全**:
   - [ ] Mock 数据不包含真实敏感信息
   - [ ] 权限检查逻辑预留

2. **性能优化**:
   - [ ] useQuery 配置合理（refetchInterval）
   - [ ] Mutation 后 invalidate 正确
   - [ ] 无不必要的重渲染

---

## Merge 决策

### ✅ 通过标准
所有以下条件满足：
- ✅ 接口与 CODEX_API_SPEC.md 100% 对齐
- ✅ 无 TypeScript/Lint 错误
- ✅ UI 功能完整可演示
- ✅ Mock 易于替换为真实 API
- ✅ 代码符合项目规范

### ⚠️ 需要修改
如果存在：
- ❌ 字段名与 API 规范不一致
- ❌ 类型定义缺失或错误
- ❌ UI 功能不完整
- ❌ 违反代码规范

### 🚨 拒绝标准
如果存在：
- 🔴 破坏现有功能
- 🔴 引入安全漏洞
- 🔴 严重性能问题

---

## PR Merge 后的后续步骤

1. **测试验证**: 在本地/Replit 测试所有功能
2. **文档更新**: 更新 CHANGELOG.md
3. **通知 Codex**: 提醒后端团队 Mock API 已就绪，可以对照实现
4. **环境配置**: 确保 `.env.development` 设置 `VITE_USE_MOCK_API=true`

---

## 联系方式

- **前端开发（Cursor）**: 已完成 Mock API 集成
- **后端开发（Codex）**: 需根据 `docs/CODEX_API_SPEC.md` 实现真实 API
- **PR Review（ChatGPT）**: 请按本指南检查并提供反馈

---

**感谢 Review！🙏**

