/**
 * 支付定价配置（常量 + 工具函数）。
 *
 * 约束：该目录只存放“配置/数据”，不包含运行时支付逻辑（如 webhook、创建 checkout 等）。
 * 运行时逻辑请放在 `extensions/payment/core`。
 */

import { PAYMENT_CONFIG } from './index';
import type {
  CreditPack,
  PlanType,
  PricingPlanMetadata,
  PricingTier,
  SubscriptionDefinition,
} from './payment.types';

/**
 * 方案常量
 */
export const PRICING_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

export type PricingPlanId = typeof PRICING_PLANS[keyof typeof PRICING_PLANS];

/**
 * 订阅计划常量（用于配置 key 与 webhook 反查）
 */
export const SUBSCRIPTION_PLANS = {
  MONTHLY_BASIC: 'monthly_basic',
  YEARLY_BASIC: 'yearly_basic',
  MONTHLY_PLUS: 'monthly_plus',
  YEARLY_PLUS: 'yearly_plus',
  MONTHLY_PRO: 'monthly_pro',
  YEARLY_PRO: 'yearly_pro',
  FREE: 'free',
} as const;

const monthlyBasicPrice =
  PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_BASIC]?.price || 0;
const monthlyPlusPrice =
  PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PLUS]?.price || 0;
const monthlyProPrice =
  PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PRO]?.price || 0;
const yearlyBasicPrice =
  PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.YEARLY_BASIC]?.price || 0;

/**
 * 月付价格配置（USD）
 */
export const PLAN_PRICES = {
  FREE: 0,
  BASIC: monthlyBasicPrice,
  PLUS: monthlyPlusPrice,
  PRO: monthlyProPrice,
} as const;

/**
 * 年付折扣百分比（基于 basic 按月折算计算）
 */
export const YEARLY_DISCOUNT_PERCENT =
  monthlyBasicPrice && yearlyBasicPrice
    ? Math.round((1 - yearlyBasicPrice / (monthlyBasicPrice * 12)) * 100)
    : 0;

/**
 * 定价方案元数据（用于 UI 展示）
 */
export const PRICING_PLANS_METADATA: Record<PlanType, PricingPlanMetadata> = {
  free: {
    id: 'free',
    monthlyPrice: PLAN_PRICES.FREE,
    colorClass:
      'bg-[linear-gradient(180deg,rgba(96,125,139,0.03)_0%,rgba(96,125,139,0.30)_100%)]',
  },
  basic: {
    id: 'basic',
    monthlyPrice: PLAN_PRICES.BASIC,
    isPopular: true,
    colorClass:
      'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(58,134,255,0.30)_100%)]',
    outerColor: 'bg-[#3A86FF]',
  },
  plus: {
    id: 'plus',
    monthlyPrice: PLAN_PRICES.PLUS,
    colorClass:
      'bg-[linear-gradient(180deg,rgba(251,86,7,0.03)_0%,rgba(251,86,7,0.30)_100%)]',
  },
  pro: {
    id: 'pro',
    monthlyPrice: PLAN_PRICES.PRO,
    colorClass:
      'bg-[linear-gradient(180deg,rgba(255,0,110,0.03)_0%,rgba(255,0,110,0.30)_100%)]',
    outerColor: 'bg-[#E91E63]',
  },
};

export const CREDIT_PACK_ACCENT_COLORS_BY_NAME: Record<string, string> = {
  mini: 'bg-[#9CA3AF]',
  standard: 'bg-[#3A86FF]',
  pro: 'bg-[#FB5607]',
  max: 'bg-[#E91E63]',
};

/**
 * Creem 产品 ID 映射（订阅）
 */
export const CREEM_PAY_PRODUCT_IDS: Record<string, string[]> = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_BASIC] ||
    [],
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.YEARLY_BASIC] ||
    [],
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PLUS] ||
    [],
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.YEARLY_PLUS] ||
    [],
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PRO] ||
    [],
  [SUBSCRIPTION_PLANS.YEARLY_PRO]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.YEARLY_PRO] ||
    [],
};

/**
 * Creem 产品 ID 映射（点数包）
 */
export const CREEM_PAY_CREDIT_PACK_PRODUCT_IDS: Record<string, string[]> =
  PAYMENT_CONFIG.providers.creem.creditPacks;

/**
 * 点数包配置（一次性购买）
 */
export const CREDIT_PACKS: CreditPack[] = PAYMENT_CONFIG.creditPacks;

const SUBSCRIPTION_DEFINITIONS = PAYMENT_CONFIG.subscriptions;
const CREDIT_PACKS_BY_ID = Object.fromEntries(
  CREDIT_PACKS.map((pack) => [pack.id, pack]),
);

const IMAGE_COST = 5;
const VIDEO_COST = 50;

const SUBSCRIPTION_CREDITS_AMOUNT_CONFIG: Record<string, number> =
  Object.fromEntries(
    Object.entries(SUBSCRIPTION_DEFINITIONS).map(([planKey, plan]) => [
      planKey,
      Math.round(plan.credits),
    ]),
  );

const SUBSCRIPTION_CREDITS_CONFIG = buildSubscriptionCreditsConfig();
const PRODUCT_ID_TO_PRICING_TIER = buildPricingTierByProductId();
const PRODUCT_ID_TO_CREDIT_PACK = buildCreditPackByProductId();

/**
 * 从产品 ID 列表中取“最新版本”（通常为最后一个）
 */
function getLatestProductId(ids?: string[]): string {
  return ids?.length ? ids[ids.length - 1] : '';
}

/**
 * 计算年付价格：用于 UI 展示或对比折扣
 */
export const calculateYearlyPrice = (monthlyPrice: number): number =>
  Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100));

/**
 * 获取订阅计划积分配额（取整）：用于积分发放/权益计算
 */
export function getSubscriptionCreditsAmount(planKey: string): number {
  return Math.round(SUBSCRIPTION_CREDITS_AMOUNT_CONFIG[planKey] || 0);
}

/**
 * 构建订阅计划的积分/并发配置（按月折算）
 */
function buildSubscriptionCreditsConfig(): Record<string, Record<string, number>> {
  return Object.fromEntries(
    Object.entries(SUBSCRIPTION_DEFINITIONS).map(([planKey, plan]) => {
      const periodMonths = plan.periodMonths || 1;
      const creditsPerMonth = plan.credits / periodMonths;
      return [
        planKey,
        {
          credits: getSubscriptionCreditsAmount(planKey),
          max_images_per_month: Math.floor(creditsPerMonth / IMAGE_COST),
          max_videos_per_month: Math.floor(creditsPerMonth / VIDEO_COST),
          image_concurrent: plan.concurrency.image,
          video_concurrent: plan.concurrency.video,
        },
      ];
    }),
  );
}

/**
 * 获取订阅计划的积分/并发配置（用于 UI 展示或限制计算）
 */
export function getSubscriptionCreditsConfig(planKey: string): Record<string, number> {
  return SUBSCRIPTION_CREDITS_CONFIG[planKey] || {};
}

/**
 * 获取订阅计划的积分配额（用于 webhook/订单处理）
 */
export function getSubscriptionQuota(subscriptionPlanType: string): number {
  return getSubscriptionCreditsAmount(subscriptionPlanType);
}

/**
 * 获取 Creem 订阅产品 ID（取历史列表中的最新值）
 */
export function getCreemPayProductId(planKey: string): string {
  return getLatestProductId(CREEM_PAY_PRODUCT_IDS[planKey]);
}

/**
 * 构建“产品 ID -> 订阅层级”的映射：用于 webhook 回调解析
 */
function buildPricingTierByProductId(): Record<string, PricingTier> {
  const mapping: Record<string, PricingTier> = {};
  Object.entries(CREEM_PAY_PRODUCT_IDS).forEach(([planKey, productIds]) => {
    productIds.filter(Boolean).forEach((productId) => {
      const [, planType] = planKey.split('_');
      mapping[productId] = {
        planType: planType as PlanType,
        subscriptionPlanType: planKey,
      };
    });
  });
  return mapping;
}

/**
 * 根据产品 ID 获取订阅层级：供 webhook/订单处理使用
 */
export function getPricingTierByProductId(productId: string): PricingTier | null {
  return PRODUCT_ID_TO_PRICING_TIER[productId] || null;
}

/**
 * 根据产品 ID 获取订阅方案详情：供 webhook/订单处理使用
 */
export function getSubscriptionPlanByProductId(
  productId: string,
): (SubscriptionDefinition & { subscriptionPlanType: string }) | null {
  const pricingTier = getPricingTierByProductId(productId);
  if (!pricingTier) return null;
  const plan = SUBSCRIPTION_DEFINITIONS[pricingTier.subscriptionPlanType];
  if (!plan) return null;
  return { ...plan, subscriptionPlanType: pricingTier.subscriptionPlanType };
}

/**
 * 构建“产品 ID -> 点数包”的映射：用于 webhook 回调解析
 */
function buildCreditPackByProductId(): Record<string, CreditPack> {
  const mapping: Record<string, CreditPack> = {};
  Object.entries(CREEM_PAY_CREDIT_PACK_PRODUCT_IDS).forEach(([packId, productIds]) => {
    const creditPack = CREDIT_PACKS_BY_ID[packId];
    if (!creditPack) return;
    productIds.filter(Boolean).forEach((productId) => {
      mapping[productId] = creditPack;
    });
  });
  return mapping;
}

/**
 * 根据产品 ID 获取点数包配置：供 webhook/订单处理使用
 */
export function getCreditPackByProductId(productId: string): CreditPack | null {
  return PRODUCT_ID_TO_CREDIT_PACK[productId] || null;
}

/**
 * 获取点数包的 Creem 产品 ID（取历史列表中的最新值）
 */
export function getCreemPayCreditPackProductId(packId: string): string {
  return getLatestProductId(CREEM_PAY_CREDIT_PACK_PRODUCT_IDS[packId]);
}

