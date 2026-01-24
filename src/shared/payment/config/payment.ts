/**
 * 支付定价配置（常量 + 工具函数）。
 *
 * 设计目标：新增套餐尽量只改 `payment-config.source.ts` + i18n 文案，
 * 其余逻辑（pricing 页/checkout/webhook）自动适配。
 *
 * 约束：该目录只存放“配置/数据”，不包含运行时支付逻辑（如 webhook、创建 checkout 等）。
 * 运行时逻辑请放在 `extensions/payment/core`。
 */

import { PAYMENT_CONFIG } from './index';
import type { CreditPack, PricingPlanMetadata, PricingTier, SubscriptionDefinition } from './payment.types';
import {
  CREDIT_PACK_ACCENT_COLORS_BY_NAME,
  PLAN_DISABLED_FEATURE_INDEXES,
  PLAN_DISPLAY,
  PLAN_ORDER,
} from './payment-config.source';
import { buildSubscriptionPlanType, getPlanIdFromSubscriptionPlanType } from './subscription-key';

export type PlanUiStyle = { colorClass: string; bgClass: string };

type PlanDisplayEntry = {
  pricingCard: { colorClass: string; outerColor?: string };
  badgeStyle: PlanUiStyle;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
};

const PLAN_DISPLAY_RECORD = PLAN_DISPLAY as Record<string, PlanDisplayEntry>;

/**
 * 套餐展示顺序（free 固定在最前）
 */
export const PRICING_PLAN_ORDER: readonly string[] = PLAN_ORDER;

/**
 * 获取套餐样式（用于设置页等轻量展示，兜底为 free）。
 */
export function getPlanUiStyle(type?: string | null): PlanUiStyle {
  const key = type || 'free';
  return PLAN_DISPLAY_RECORD[key]?.badgeStyle ?? PLAN_DISPLAY_RECORD.free.badgeStyle;
}

/**
 * 获取定价页 features 中需要置灰的条目 index（兜底为空数组）。
 */
export function getPlanDisabledFeatureIndexes(planId: string): number[] {
  return PLAN_DISABLED_FEATURE_INDEXES[planId] || [];
}

/**
 * 定价方案元数据（用于 pricing UI：颜色/徽章/显示用月价）
 */
export const PRICING_PLANS_METADATA: Record<string, PricingPlanMetadata> = Object.fromEntries(
  PRICING_PLAN_ORDER.map((planId) => {
    const monthlyKey = buildSubscriptionPlanType('monthly', planId);
    const monthlyPrice =
      planId === 'free' ? 0 : PAYMENT_CONFIG.subscriptions[monthlyKey]?.price || 0;

    const meta =
      PLAN_DISPLAY_RECORD[planId]?.pricingCard ?? PLAN_DISPLAY_RECORD.free.pricingCard;
    const isPopular = PLAN_DISPLAY_RECORD[planId]?.isPopular;
    const isSpecialOffer = PLAN_DISPLAY_RECORD[planId]?.isSpecialOffer;

    return [
      planId,
      {
        id: planId,
        monthlyPrice,
        colorClass: meta.colorClass,
        outerColor: meta.outerColor,
        ...(isPopular ? { isPopular: true } : {}),
        ...(isSpecialOffer ? { isSpecialOffer: true } : {}),
      },
    ];
  }),
);

/**
 * 点数包卡片外框渐变色（按 pack.name 匹配）
 */
export { CREDIT_PACK_ACCENT_COLORS_BY_NAME };

/**
 * Creem 产品 ID 映射（订阅）
 *
 * key: subscriptionPlanType（如 monthly_basic / yearly_pro）
 */
export const CREEM_PAY_PRODUCT_IDS: Record<string, string[]> =
  PAYMENT_CONFIG.providers.creem.subscriptions;

/**
 * Creem 产品 ID 映射（点数包）
 *
 * key: creditPackId（如 mini_30d）
 */
export const CREEM_PAY_CREDIT_PACK_PRODUCT_IDS: Record<string, string[]> =
  PAYMENT_CONFIG.providers.creem.creditPacks;

/**
 * 点数包配置（一次性购买）
 */
export const CREDIT_PACKS: CreditPack[] = PAYMENT_CONFIG.creditPacks;

const SUBSCRIPTION_DEFINITIONS = PAYMENT_CONFIG.subscriptions;
const CREDIT_PACKS_BY_ID = Object.fromEntries(CREDIT_PACKS.map((pack) => [pack.id, pack]));

const IMAGE_COST = 5;
const VIDEO_COST = 50;

const SUBSCRIPTION_CREDITS_AMOUNT_CONFIG: Record<string, number> = Object.fromEntries(
  Object.entries(SUBSCRIPTION_DEFINITIONS).map(([planKey, plan]) => [planKey, Math.round(plan.credits)]),
);

const SUBSCRIPTION_CREDITS_CONFIG = buildSubscriptionCreditsConfig();
const PRODUCT_ID_TO_PRICING_TIER = buildPricingTierByProductId();
const PRODUCT_ID_TO_CREDIT_PACK = buildCreditPackByProductId();

/**
 * 年付折扣百分比（用于 pricing 页顶部 “SAVE xx%”）
 *
 * 默认：优先用 basic（月/年）计算；若不存在，则回退为任意第一个同时具备 monthly+yearly 的套餐。
 */
export const YEARLY_DISCOUNT_PERCENT = (() => {
  const preferred = 'basic';
  const pick = (planId: string) => {
    const monthly = SUBSCRIPTION_DEFINITIONS[buildSubscriptionPlanType('monthly', planId)]?.price;
    const yearly = SUBSCRIPTION_DEFINITIONS[buildSubscriptionPlanType('yearly', planId)]?.price;
    if (typeof monthly === 'number' && typeof yearly === 'number' && monthly > 0 && yearly > 0) {
      return { monthly, yearly };
    }
    return null;
  };

  const preferredPair = pick(preferred);
  if (preferredPair) {
    return Math.round((1 - preferredPair.yearly / (preferredPair.monthly * 12)) * 100);
  }

  for (const planId of PRICING_PLAN_ORDER) {
    if (planId === 'free') continue;
    const pair = pick(planId);
    if (pair) {
      return Math.round((1 - pair.yearly / (pair.monthly * 12)) * 100);
    }
  }

  return 0;
})();

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

  Object.entries(CREEM_PAY_PRODUCT_IDS).forEach(([subscriptionPlanType, productIds]) => {
    const planType = getPlanIdFromSubscriptionPlanType(subscriptionPlanType);
    productIds.filter(Boolean).forEach((productId) => {
      mapping[productId] = {
        planType,
        subscriptionPlanType,
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
