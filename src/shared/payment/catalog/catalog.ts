import { buildSubscriptionPlanType } from "../subscription-key";
import type { CreditPackDefinition, SubscriptionDefinition } from "../types";
import { CREDIT_PACK_SOURCES, SUBSCRIPTION_PLAN_SOURCES } from "./source";

/**
 * Catalog 派生数据（不可编辑）。
 *
 * `source.ts` 只描述“业务商品定义”；本文件将其转换为程序更容易使用的结构：
 * - `PLAN_IDS`：订阅 planId 列表（用于 UI 排序/展示）
 * - `CREDIT_PACKS`：点数包列表（点数包 `id` 即 SKU）
 * - `SUBSCRIPTIONS`：订阅 SKU -> SubscriptionDefinition
 */
export const PLAN_IDS = SUBSCRIPTION_PLAN_SOURCES.map((plan) => plan.id);

/**
 * 点数包目录（id 即 SKU）。
 */
export const CREDIT_PACKS: CreditPackDefinition[] = CREDIT_PACK_SOURCES.map((pack) => ({
  id: pack.id,
  name: pack.name,
  price: pack.price,
  bonusRate: pack.bonusRate,
  credits: pack.credits,
  validDays: pack.validDays,
}));

/**
 * 订阅目录：键名为订阅 SKU（例如 `monthly_basic` / `yearly_pro`）。
 */
export const SUBSCRIPTIONS: Record<string, SubscriptionDefinition> = Object.fromEntries(
  SUBSCRIPTION_PLAN_SOURCES.flatMap((plan) => {
    const monthlyKey = buildSubscriptionPlanType("monthly", plan.id);
    const yearlyKey = buildSubscriptionPlanType("yearly", plan.id);

    return [
      [
        monthlyKey,
        {
          planType: plan.id,
          billingCycle: "monthly",
          price: plan.monthly.price,
          credits: plan.monthly.credits,
          periodMonths: plan.monthly.periodMonths,
          concurrency: plan.monthly.concurrency,
        },
      ],
      [
        yearlyKey,
        {
          planType: plan.id,
          billingCycle: "yearly",
          price: plan.yearly.price,
          credits: plan.yearly.credits,
          periodMonths: plan.yearly.periodMonths,
          concurrency: plan.yearly.concurrency,
        },
      ],
    ] as const;
  }),
);

const CREDIT_PACKS_BY_ID = Object.fromEntries(CREDIT_PACKS.map((pack) => [pack.id, pack]));

/**
 * 根据点数包 SKU 获取定义（找不到则返回 null）。
 */
export function getCreditPackById(packId: string): CreditPackDefinition | null {
  return CREDIT_PACKS_BY_ID[packId] || null;
}

/**
 * 根据订阅 SKU 获取定义（找不到则返回 null）。
 */
export function getSubscriptionBySku(subscriptionSku: string): SubscriptionDefinition | null {
  return SUBSCRIPTIONS[subscriptionSku] || null;
}
