# Payment / Pricing 重构方案（草案）

> 目标：提升“插件（`extensions/payment`） vs 配置/数据（`src/shared/payment`、`src/app/**`）”的解耦程度，并让定价/支付相关代码更易读、更易扩展（未来接入更多 provider 也不需要大改 UI）。

## 0. 现状梳理（基于当前代码）

### 目录职责（当前）

- `extensions/payment/core/**`
  - Provider 适配（例如 `creem`）+ webhook event 分发（偏运行时逻辑）
- `extensions/payment/components/pricing/**`
  - Pricing UI（Cards、CreditPacks、PaymentIcons 等）
  - **当前痛点**：UI 组件内部直接调用 `createPaymentCheckout`（网络 + 路由跳转）
- `src/shared/payment/config/**`
  - 支付配置（plans、credit packs、provider product ids、以及一批派生逻辑）
  - **当前痛点**：`payment.ts` 同时承载了 UI 元信息、provider 映射、额度/并发计算、webhook 反查映射
- `src/app/api/payment/checkout/route.ts`
  - Server 侧创建 checkout（调用 extension provider adapter）
- `src/server/payment/creem-webhook-handlers.ts`
  - Webhook 落库/发放积分（依赖 `src/shared/payment/config/payment.ts` 的 productId 反查）

### 典型耦合点（需要优先解决）

1. **UI 组件依赖运行时支付创建**  
   `extensions/payment/components/pricing/PricingCard.tsx`、`extensions/payment/components/pricing/CreditPacks.tsx` 内部调用 `createPaymentCheckout`（网络请求 + `window.location.href`）。

2. **`createPaymentCheckout` 内部硬编码 provider 路由**  
   `extensions/payment/core/client.ts` 使用 `/api/adapter/creem/:type` 作为 successUrl（provider 绑定为 creem），与 `src/app/api/payment/checkout/route.ts` 的“可切换 provider”目标冲突。

3. **配置模块混杂多种关注点（可读性差、改动扩散）**  
   `src/shared/payment/config/payment.ts` 同时包含：
   - Pricing UI 元数据（颜色/徽章/展示顺序）
   - Creem product id 的正/反向映射（供 webhook & success 页面使用）
   - credits/并发/额度等派生规则

4. **页面层 import 过重**  
   `src/app/[locale]/pricing/_components/PricingPageClient.tsx` 引入大量 config/工具函数，导致“页面=胶水逻辑”太厚，可读性下降。

## 1. 重构目标（可验收）

### 目标 A：UI 组件纯展示（插件化）

- `extensions/payment/components/**` 不直接：
  - `fetch(...)` / `window.location...`
  - 依赖项目内 API 路由约定（例如 `/api/payment/checkout`、`/api/adapter/...`）
- UI 组件通过 props 接收：
  - `onCheckout(intent)`（或更轻量的 `onSubscribe(planId, cycle)` / `onBuyPack(packId)`）
  - loading 状态/错误信息由外部注入（或回调返回 Promise）

### 目标 B：Checkout API 以“业务 SKU”为输入，而不是 provider productId

- 前端发起 checkout 不需要知道 `productId`
- `POST /api/payment/checkout` 接收：
  - `kind: 'sub' | 'one-time'`
  - `sku: string`（例如 `monthly_basic`、`mini_30d`）
  - `metadata/customer`
- Server 侧基于 `DEFAULT_PAYMENT_PROVIDER` + catalog 映射，解析出当前 provider 的 `productId` 并创建 checkout

### 目标 C：配置拆分为小而清晰的模块

把 `src/shared/payment/config/payment.ts` 拆成几块（名字可按实际落地调整）：

- `catalog/*`：业务 SKU 定义、价格/credits/周期等“产品定义”
- `providers/<provider>/*`：provider 的 `sku <-> productId` 映射（含历史 ID）
- `entitlements/*`：credits/并发/额度等派生规则（纯函数）
- `ui/*`（或挪到 `src/app/**`）：仅 UI 需要的展示元数据（颜色、徽章、排序、disabled features）

### 目标 D：可维护的依赖方向

建议依赖方向固定为：

`src/app/**`（页面/文案/i18n/组装）  
→ `src/shared/payment/**`（业务定义/映射/纯函数）  
→ `extensions/payment/core/**`（provider 适配器）  

并且 **反方向依赖禁止**（extension 不应 import `@/shared/*` 或 `@/app/*`）。

## 2. 推荐的目标目录结构（提案）

```
src/shared/payment/
  catalog/
    source.ts                 # 现有 payment-config.source.ts 的“产品定义”部分
    skus.ts                   # SKU 规则（subscriptionKey 等）
  entitlements/
    credits.ts                # credits/并发/额度推导（纯函数）
  providers/
    creem/
      products.ts             # 现有 config/products/creem/* 合并/整理后的入口
      mapping.ts              # sku <-> productId（含反查）
  ui/
    pricing-ui.ts             # plan 顺序、颜色、徽章、disabled features（只给 UI 用）
  index.ts                    # 小而稳的对外入口（只 re-export 必要能力）

extensions/payment/
  core/                       # 保持 provider adapter/webhooks
  components/pricing/         # 纯 UI（移除 checkout 调用）

src/app/api/payment/checkout/route.ts
  # 改为接收 sku，而非 productId；successUrl 在 server 侧生成
```

> 注：如果你希望把“UI 元数据”完全留在 app 层，也可以把 `src/shared/payment/ui/*` 改为 `src/app/[locale]/pricing/_lib/*`（更“业务站点化”）。

## 3. 迁移策略（分阶段，小步可回滚）

### Phase 1：引入 SKU Checkout（不动 UI 外观）

1. 新增 `resolveProductId(provider, { kind, sku })`（放到 `src/shared/payment/providers/<provider>/mapping.ts`）
2. 改 `POST /api/payment/checkout`：
   - 入参从 `productId` → `sku`
   - 在 server 侧：
     - 生成 `successUrl`（不要让 client 拼）
     - resolve 出 provider `productId`
3. 更新 `createPaymentCheckout`（建议移出 `extensions/payment/core/client.ts` 到 `src/shared/payment/client/*` 或 `src/lib/payment/*`）
   - 入参改为 `sku`，内部调用新 API

验收：
- 前端不再手写/传递 `productId` 即可成功下单
- provider 切换时不会因为 client 硬编码 `/api/adapter/creem/*` 而出错

### Phase 2：UI 组件去网络化（插件解耦核心步骤）

1. `PricingCard`、`CreditPacks` 改为接收 `onCheckout(...)`
2. 在 `PricingPageClient`（或其抽出来的 view-model 层）提供实现：
   - 组装 `sku`、`metadata`、`customer`
   - 调用 `createPaymentCheckout`，并处理跳转

验收：
- `extensions/payment/components/pricing/**` 不再 import `../../core/client`
- UI 组件可在“没有支付 API”的环境中复用（只要传回调）

### Phase 3：拆分 `payment.ts`（可读性/职责分离）

1. 把 provider 映射相关（`getCreemPayProductId`、`getPricingTierByProductId`、`getCreditPackByProductId` 等）迁移到 `providers/creem/mapping.ts`
2. 把 credits/并发派生迁移到 `entitlements/credits.ts`
3. 把 UI 元信息迁移到 `ui/pricing-ui.ts`（或 app 层）
4. 保持对外 API 兼容（先做 re-export，最后再收口）

验收：
- 单文件长度显著下降
- webhook handler / success 页面导入路径更语义化（例如 `providers/creem/mapping` vs `config/payment`）

### Phase 4：薄化页面（提高可读性）

1. 抽出 `buildPricingViewModel(t, user, config)`（例如放 `src/app/[locale]/pricing/_lib/*`）
2. `PricingPageClient.tsx` 只保留：
   - i18n 获取
   - user 状态读取
   - 调用 builder 得到 props
   - render 组件

验收：
- `PricingPageClient.tsx` import 数量/逻辑块显著减少

## 4. 需要注意的点（风险 & 约束）

- Webhook 反查强依赖 “productId → sku/plan” 的稳定性：拆分时优先保证反查映射不变（历史 productId 仍可解析）。
- 建议把“历史 productIds”作为 provider mapping 的一等公民（现在已有 historical/current 设计，继续沿用即可）。
- Vercel/Next.js 性能建议：尽量减少 barrel exports 带来的 bundle 扩散（`@extensions/payment/components/pricing` 可逐步改为直接路径导入，或保证 tree-shaking 友好）。

## 5. 下一步（你确认后我再动代码）

请你确认两点偏好，我就按这个方案开始分阶段重构：

1. SKU 命名：订阅用现有 `monthly_basic` 这种，点数包用 `mini_30d` 这种，是否都统一叫 `sku`？
2. UI 元信息（颜色/徽章/排序）放哪里：留在 `src/shared/payment/ui/*` 还是挪到 `src/app/[locale]/pricing/_lib/*`（更业务化）？

