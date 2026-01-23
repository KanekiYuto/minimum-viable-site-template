/**
 * 定价配置（仅常量与静态映射）
 */
import { PAYMENT_CONFIG } from './index';
import type { CreditPack, PlanType, PricingPlanMetadata } from './payment.types';

// 方案常量
export const PRICING_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

export type PricingPlanId = typeof PRICING_PLANS[keyof typeof PRICING_PLANS];

// 订阅计划常量
export const SUBSCRIPTION_PLANS = {
  MONTHLY_BASIC: 'monthly_basic',
  YEARLY_BASIC: 'yearly_basic',
  MONTHLY_PLUS: 'monthly_plus',
  YEARLY_PLUS: 'yearly_plus',
  MONTHLY_PRO: 'monthly_pro',
  YEARLY_PRO: 'yearly_pro',
  FREE: 'free',
} as const;

const monthlyBasicPrice = PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_BASIC]?.price || 0;
const monthlyPlusPrice = PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PLUS]?.price || 0;
const monthlyProPrice = PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PRO]?.price || 0;
const yearlyBasicPrice = PAYMENT_CONFIG.subscriptions[SUBSCRIPTION_PLANS.YEARLY_BASIC]?.price || 0;

// 月付价格配置 (USD)
export const PLAN_PRICES = {
  FREE: 0,
  BASIC: monthlyBasicPrice,
  PLUS: monthlyPlusPrice,
  PRO: monthlyProPrice,
} as const;

// 年付折扣百分比（基于 basic 年/月计算）
export const YEARLY_DISCOUNT_PERCENT =
  monthlyBasicPrice && yearlyBasicPrice
    ? Math.round((1 - yearlyBasicPrice / (monthlyBasicPrice * 12)) * 100)
    : 0;

// 定价方案元数据（用于 UI 展示）
export const PRICING_PLANS_METADATA: Record<PlanType, PricingPlanMetadata> = {
  free: {
    id: 'free',
    monthlyPrice: PLAN_PRICES.FREE,
    colorClass: 'bg-[linear-gradient(180deg,rgba(96,125,139,0.03)_0%,rgba(96,125,139,0.30)_100%)]',
  },
  basic: {
    id: 'basic',
    monthlyPrice: PLAN_PRICES.BASIC,
    isPopular: true,
    colorClass: 'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(58,134,255,0.30)_100%)]',
    outerColor: 'bg-[#3A86FF]',
  },
  plus: {
    id: 'plus',
    monthlyPrice: PLAN_PRICES.PLUS,
    colorClass: 'bg-[linear-gradient(180deg,rgba(251,86,7,0.03)_0%,rgba(251,86,7,0.30)_100%)]',
  },
  pro: {
    id: 'pro',
    monthlyPrice: PLAN_PRICES.PRO,
    colorClass: 'bg-[linear-gradient(180deg,rgba(255,0,110,0.03)_0%,rgba(255,0,110,0.30)_100%)]',
    outerColor: 'bg-[#E91E63]',
  },
};

export const CREDIT_PACK_ACCENT_COLORS_BY_NAME: Record<string, string> = {
  mini: 'bg-[#9CA3AF]',
  standard: 'bg-[#3A86FF]',
  pro: 'bg-[#FB5607]',
  max: 'bg-[#E91E63]',
};

// Creem 产品 ID 映射（订阅）
export const CREEM_PAY_PRODUCT_IDS: Record<string, string[]> = {
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_BASIC] || [],
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.YEARLY_BASIC] || [],
  [SUBSCRIPTION_PLANS.MONTHLY_PLUS]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PLUS] || [],
  [SUBSCRIPTION_PLANS.YEARLY_PLUS]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.YEARLY_PLUS] || [],
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.MONTHLY_PRO] || [],
  [SUBSCRIPTION_PLANS.YEARLY_PRO]:
    PAYMENT_CONFIG.providers.creem.subscriptions[SUBSCRIPTION_PLANS.YEARLY_PRO] || [],
};

// Creem 产品 ID 映射（积分包）
export const CREEM_PAY_CREDIT_PACK_PRODUCT_IDS: Record<string, string[]> =
  PAYMENT_CONFIG.providers.creem.creditPacks;

// 一次性积分包配置
export const CREDIT_PACKS: CreditPack[] = PAYMENT_CONFIG.creditPacks;
