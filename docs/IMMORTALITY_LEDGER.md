# Immortality Ledger & Stripe Flow

Layer 2 负责把法币 inflow 记入中心化账本，确保随时可兑/可审计。该文件说明数据库结构、API 以及测试步骤。

## 数据表

| 表 | 作用 |
| --- | --- |
| `fiat_transactions` | 记录每次 Stripe Checkout：金额、币种、状态、credits 数量、Stripe session id |
| `user_balances` | 每个用户的 Immortality Credits / 待发 POI（1 行 1 个 userId） |
| `immortality_ledger` | 账本明细，任何加/减 credits 都会留下 credit/debit 记录 |

## API & 流程

1. 前端调用 `POST /api/stripe/create-checkout-session`（需要登录）
   - 校验金额（$1-$10k）
   - 创建 `fiat_transactions` 记录（status=pending, credits=Math.round(amount)）
   - 创建 Stripe Checkout Session，`success_url=/recharge?session_id=...`
   - 更新 `fiat_transactions.stripeSessionId`
2. Stripe Webhook → `POST /api/stripe/webhook`
   - 验证签名
   - `checkout.session.completed`：更新 `fiat_transactions.status=completed`，写 `immortality_ledger`，并通过 `adjustImmortalityCredits` 增加 `user_balances.immortalityCredits`
   - 其它失败状态：标记 status=failed
3. 前端 `/recharge`
   - 读取 `GET /api/immortality/balance` 显示 credits
   - 如果 URL 含有 `session_id`，提示“充值处理中”并触发 refetch

## Stripe 测试模式

在 `.env` 或 Secrets 中设置：

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
BASE_URL=http://localhost:5173
```

运行 `npm run dev:frontend`，在 `/recharge` 选择金额后会跳转 Stripe。使用测试卡 `4242 4242 4242 4242` 即可完成流程。
Webhook 在 `server/routes.ts` 中复用了 `/api/stripe-webhook` 与 `/api/stripe/webhook` 两个路径，确保本地/部署环境均可监听。

## 对账 & 导出

- `fiat_transactions`：查看每笔 Stripe session 状态与 credits。
- `user_balances`：对应用户当前余额。
- `immortality_ledger`：详细的 credit/debit 记录，可用来重建余额或导出 CSV。

## 与 Layer 1 的关系

Immortality Credits 只是进入 POI 经济的另一扇门：

1. Crypto 用户（Layer 1）直接在 `/market` 使用 TGESale 合约购入 POI；
2. Web2 用户（Layer 2）通过 Stripe 获得 credits，稍后可兑换 POI 或在 Immortality 产品内直接消费；
3. 所有消费/兑换最终都会进入 `user_balances` / `immortality_ledger`，与智能合约产生的 POI 保持 1:1 经济关系。

前端入口在 `/immortality` 页面：  
- Immortality Balance 模块读取 `/api/immortality/balance` 并展示 Credits；  
- “Recharge Credits” 按钮跳转到 `/recharge`（Stripe 流程）；  
- “Consciousness Upload” 卡片预留消费 Credits 的 UI。  

> 只要遵守“法币→Ledger→链上/产品”的顺序，就能在上线初期兼顾合规与业务速度。


