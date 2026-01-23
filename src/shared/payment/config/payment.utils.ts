/**
 * 定价工具函数（仅函数与计算逻辑）
 */
import { PAYMENT_CONFIG } from './index';
import type { CreditPack, PlanType, PricingTier, SubscriptionDefinition } from './payment.types';
import {
  CREEM_PAY_CREDIT_PACK_PRODUCT_IDS,
  CREEM_PAY_PRODUCT_IDS,
  CREDIT_PACKS,
  YEARLY_DISCOUNT_PERCENT,
} from './payment.constants';

const SUBSCRIPTION_DEFINITIONS = PAYMENT_CONFIG.subscriptions;
const CREDIT_PACKS_BY_ID = Object.fromEntries(CREDIT_PACKS.map((pack) => [pack.id, pack]));

const IMAGE_COST = 5;
const VIDEO_COST = 50;

const SUBSCRIPTION_CREDITS_AMOUNT_CONFIG: Record<string, number> = Object.fromEntries(
  Object.entries(SUBSCRIPTION_DEFINITIONS).map(([planKey, plan]) => [planKey, Math.round(plan.credits)])
);

const SUBSCRIPTION_CREDITS_CONFIG = buildSubscriptionCreditsConfig();
const PRODUCT_ID_TO_PRICING_TIER = buildPricingTierByProductId();
const PRODUCT_ID_TO_CREDIT_PACK = buildCreditPackByProductId();

/**
 * 从产品 ID 列表中取最新版本（通常为最后一个）。
 */
function getLatestProductId(ids?: string[]): string {
  return ids?.length ? ids[ids.length - 1] : '';
}

/**
 * 计算年付价格，用于 UI 展示或对比折扣。
 */
export const calculateYearlyPrice = (monthlyPrice: number): number =>
  Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100));

/**
 * 获取订阅计划积分金额（取整数），用于数据库积分管理。
 */
export function getSubscriptionCreditsAmount(planKey: string): number {
  return Math.round(SUBSCRIPTION_CREDITS_AMOUNT_CONFIG[planKey] || 0);
}

/**
 * 构建订阅计划的积分配置（按月折算 + 并发限制）。
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
    })
  );
}

/**
 * 获取订阅计划积分配置，用于订阅权益展示或限制计算。
 */
export function getSubscriptionCreditsConfig(planKey: string): Record<string, number> {
  return SUBSCRIPTION_CREDITS_CONFIG[planKey] || {};
}

/**
 * 获取订阅计划的积分配额（用于账务或权益判定）。
 */
export function getSubscriptionQuota(subscriptionPlanType: string): number {
  return getSubscriptionCreditsAmount(subscriptionPlanType);
}

/**
 * 获取 Creem 订阅产品 ID（取历史列表中的最新值）。
 */
export function getCreemPayProductId(planKey: string): string {
  return getLatestProductId(CREEM_PAY_PRODUCT_IDS[planKey]);
}

/**
 * 构建从产品 ID 反查订阅层级的映射，用于 webhook 回调解析。
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
 * 根据产品 ID 获取订阅层级，供回调/订单处理使用。
 */
export function getPricingTierByProductId(productId: string): PricingTier | null {
  return PRODUCT_ID_TO_PRICING_TIER[productId] || null;
}

/**
 * 根据产品 ID 获取订阅方案详情，供回调/订单处理使用。
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
 * 构建从产品 ID 反查积分包的映射，用于 webhook 回调解析。
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
 * 根据产品 ID 获取积分包配置，供回调/订单处理使用。
 */
export function getCreditPackByProductId(productId: string): CreditPack | null {
  return PRODUCT_ID_TO_CREDIT_PACK[productId] || null;
}

/**
 * 获取积分包的 Creem 产品 ID（取历史列表中的最新值）。
 */
export function getCreemPayCreditPackProductId(packId: string): string {
  return getLatestProductId(CREEM_PAY_CREDIT_PACK_PRODUCT_IDS[packId]);
}
