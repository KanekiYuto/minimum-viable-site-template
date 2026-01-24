import type {
  BillingCycleConfig,
  CreditPackPlan,
  SubscriptionPricingPlan,
} from "@extensions/payment/components/pricing/types";
import {
  CREDIT_PACKS,
  getSubscriptionBySku,
} from "@/shared/payment/catalog/catalog";
import { getSubscriptionCreditsConfig } from "@/shared/payment/entitlements/subscription";
import { buildSubscriptionPlanType } from "@/shared/payment/subscription-key";
import {
  CREDIT_PACK_ACCENT_COLORS_BY_NAME,
  getPlanDisabledFeatureIndexes,
  getPricingCardDisplay,
  PRICING_PLAN_ORDER,
} from "./pricing-ui";

/**
 * Pricing 页的数据组装层（只负责“构造 UI 需要的数据”）。
 *
 * 设计目标：
 * - UI 组件（extensions）保持纯展示：不关心 SKU/productId，也不依赖 next-intl。
 * - 此处将 catalog + entitlements + pricing UI 元信息 + i18n 文案组装为组件 props。
 */
type Translate = (
  (key: string, values?: Record<string, string | number | Date>) => string
) & {
  raw: (key: string) => unknown;
};

/**
 * 基于一个“代表性套餐”（默认为第一个非 free 套餐）的月/年价格差，推导年付折扣百分比。
 * 用途：pricing 顶部 “SAVE xx%” 的展示。
 */
export function getYearlyDiscountPercent(fallbackPercent = 0): number {
  const planId = PRICING_PLAN_ORDER.find((id) => id !== "free") || null;
  if (!planId) return fallbackPercent;

  const monthlySku = buildSubscriptionPlanType("monthly", planId);
  const yearlySku = buildSubscriptionPlanType("yearly", planId);
  const monthly = getSubscriptionBySku(monthlySku);
  const yearly = getSubscriptionBySku(yearlySku);
  if (!monthly || !yearly || monthly.price <= 0) return fallbackPercent;

  const percent = Math.round((1 - yearly.price / (monthly.price * 12)) * 100);
  return Number.isFinite(percent) && percent > 0 ? percent : fallbackPercent;
}

export function calculateYearlyPrice(monthlyPrice: number, yearlyDiscountPercent: number): number {
  return Math.round(monthlyPrice * 12 * (1 - yearlyDiscountPercent / 100));
}

/**
 * 构建计费周期 tab 配置（订阅：monthly/yearly；点数包：onetime）。
 */
export function buildBillingCycles(tPricing: Translate): BillingCycleConfig[] {
  const savePercent = getYearlyDiscountPercent();
  return [
    { id: "monthly", label: tPricing("billingCycle.monthly") },
    { id: "yearly", label: tPricing("billingCycle.yearly"), savePercent },
    { id: "onetime", label: tPricing("billingCycle.onetime") },
  ];
}

/**
 * 构建订阅套餐卡片数据（按 monthly/yearly 分组）。
 *
 * 注意：
 * - 返回值不包含 productId（SKU checkout 已在页面层处理）。
 * - 特性文案使用 `tPricing.raw` 判断 features 数组长度，避免硬编码数量。
 */
export function buildSubscriptionPlansByCycle(tPricing: Translate): Record<"monthly" | "yearly", SubscriptionPricingPlan[]> {
  const buildPlans = (billingCycle: "monthly" | "yearly"): SubscriptionPricingPlan[] => {
    const getSubscriptionSku = (planId: string) =>
      buildSubscriptionPlanType(billingCycle, planId);

    type FeatureValues = Record<string, string | number | Date>;

    const buildFeatures = (planId: string, values: FeatureValues) => {
      const raw = tPricing.raw(`plans.${planId}.features`) as unknown;
      const count = Array.isArray(raw) ? raw.length : 0;
      const disabled = new Set(getPlanDisabledFeatureIndexes(planId));

      return Array.from({ length: count }, (_, i) => ({
        text: tPricing(`plans.${planId}.features.${i}`, values),
        ...(disabled.has(i) ? { isNotSupported: true } : {}),
      }));
    };

    return PRICING_PLAN_ORDER.map((planId) => {
      const display = getPricingCardDisplay(planId);

      if (planId === "free") {
        return {
          id: "free",
          name: tPricing("plans.free.name"),
          monthlyPrice: 0,
          yearlyPrice: 0,
          ctaText: tPricing("plans.free.ctaText"),
          colorClass: display.pricingCard.colorClass,
          features: buildFeatures("free", {
            credits: 100,
            images: 20,
            concurrent: 1,
          }),
        };
      }

      const monthlySku = buildSubscriptionPlanType("monthly", planId);
      const yearlySku = buildSubscriptionPlanType("yearly", planId);
      const monthly = getSubscriptionBySku(monthlySku);
      const yearly = getSubscriptionBySku(yearlySku);

      const monthlyPrice = monthly?.price || 0;
      const yearlyPrice = yearly?.price || 0;

      const config = getSubscriptionCreditsConfig(getSubscriptionSku(planId));

      return {
        id: planId,
        name: tPricing(`plans.${planId}.name`),
        monthlyPrice,
        ...(yearlyPrice > 0 ? { yearlyPrice } : {}),
        ctaText: tPricing(`plans.${planId}.ctaText`),
        ...(display.isPopular ? { isPopular: true } : {}),
        ...(display.isSpecialOffer ? { isSpecialOffer: true } : {}),
        colorClass: display.pricingCard.colorClass,
        ...(display.pricingCard.outerColor ? { outerColor: display.pricingCard.outerColor } : {}),
        features: buildFeatures(planId, {
          credits: config.credits,
          images: config.max_images_per_month,
          videos: config.max_videos_per_month,
          imageConcurrent: config.image_concurrent,
          videoConcurrent: config.video_concurrent,
          support: "7×24",
        }),
      };
    });
  };

  return {
    monthly: buildPlans("monthly"),
    yearly: buildPlans("yearly"),
  };
}

/**
 * 构建点数包卡片数据（一次性购买）。
 */
export function buildCreditPacks(): CreditPackPlan[] {
  return CREDIT_PACKS.map((pack) => ({
    id: pack.id,
    name: pack.name,
    price: pack.price,
    credits: pack.credits,
    validDays: pack.validDays,
    bonusRate: pack.bonusRate,
    accentColor: CREDIT_PACK_ACCENT_COLORS_BY_NAME[pack.name.toLowerCase()] || undefined,
  }));
}
