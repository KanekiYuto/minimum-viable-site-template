/**
 * Payment 领域类型（仅数据结构/类型定义）。
 *
 * 核心概念：
 * - `sku`：业务侧的稳定标识（跨支付平台、用于 UI / 订单 / webhook 关联）
 *   - 订阅 SKU：`${billingCycle}_${planId}`，例如 `monthly_basic`
 *   - 点数包 SKU：直接使用 packId，例如 `mini_30d`
 * - `productId`：支付平台侧的产品标识（Creem/Stripe/...）
 *   - 只在服务端通过 provider mapping 与 SKU 互相转换
 *   - UI 不应直接依赖 `productId`
 */

import type { SubscriptionBillingCycle } from "./subscription-key";

export type { PaymentProvider } from "@extensions/payment/shared/types";

/**
 * 订阅计费周期（用于订阅 SKU 的前缀）。
 */

/**
 * 套餐类型（站内权限/展示用）。
 *
 * 注意：
 * - 数据库字段为 text，因此保持开放类型，便于未来扩展（例如 enterprise）。
 * - 内置套餐仍建议使用：free/basic/plus/pro。
 */
export type PlanType = string;

/**
 * 点数包定义（业务侧）。`id` 同时作为点数包 SKU 使用。
 */
export interface CreditPackDefinition {
  /** packId / SKU，例如 `mini_30d` */
  id: string;
  /** 展示名（用于 UI），例如 `mini` */
  name: string;
  /** 价格（以主币单位，通常为 USD），例如 `10` 表示 $10 */
  price: number;
  /** 赠送比例：0.15 表示 +15% credits */
  bonusRate?: number;
  /** 总点数（含赠送） */
  credits: number;
  /** 有效期（天） */
  validDays: number;
}

/**
 * 订阅定义（业务侧）。键名由订阅 SKU（`monthly_basic`）承担。
 */
export interface SubscriptionDefinition {
  /** 套餐类型（不含 free） */
  planType: Exclude<PlanType, "free">;
  /** 计费周期 */
  billingCycle: SubscriptionBillingCycle;
  /** 价格（以主币单位，通常为 USD） */
  price: number;
  /** 周期内总点数（不是“每月”） */
  credits: number;
  /** 周期月数：monthly=1，yearly=12 */
  periodMonths: number;
  /** 并发限制（用于衍生 UI 文案与服务端配额判断） */
  concurrency: {
    image: number;
    video: number;
  };
}
