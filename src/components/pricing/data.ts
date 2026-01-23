import { PricingPlan, BillingCycleConfig } from "./types";
import { PRICING_PLANS_METADATA, YEARLY_DISCOUNT_PERCENT, getSubscriptionCreditsConfig, getCreemPayProductId, calculateYearlyPrice } from "@/shared/payment/config/payment";
import { PAYMENT_CONFIG } from "@/shared/payment/config";

/**
 * 创建计费周期配置
 * @param t 翻译函数
 */
export function createBillingCycles(t: (key: string) => string): BillingCycleConfig[] {
  return [
    { id: "monthly", label: t("billingCycle.monthly") },
    { id: "yearly", label: t("billingCycle.yearly"), savePercent: YEARLY_DISCOUNT_PERCENT },
    { id: "onetime", label: t("billingCycle.onetime") },
  ];
}

/**
 * 创建定价方案数据
 * @param t 翻译函数
 * @param billingCycle 计费周期 ('monthly' | 'yearly')
 */
export function createPricingPlans(t: (key: string, values?: Record<string, string | number>) => string, billingCycle: 'monthly' | 'yearly' = 'monthly'): PricingPlan[] {
  const plansMetadata = PRICING_PLANS_METADATA;

  // 根据计费周期选择对应的积分配置
  const getCreditsConfig = (planId: string) => {
    const key = billingCycle === 'yearly' ? `yearly_${planId}` : `monthly_${planId}`;
    return getSubscriptionCreditsConfig(key);
  };

  // 根据计费周期获取对应的产品 ID
  const getProductId = (planId: string) => {
    const key = billingCycle === 'yearly' ? `yearly_${planId}` : `monthly_${planId}`;
    return getCreemPayProductId(key);
  };

  const getYearlyPrice = (planId: string, monthlyPrice: number) => {
    const yearlyKey = `yearly_${planId}`;
    const yearlyPrice = PAYMENT_CONFIG.subscriptions[yearlyKey]?.price;
    return typeof yearlyPrice === 'number' ? yearlyPrice : calculateYearlyPrice(monthlyPrice);
  };

  return [
    {
      id: "free",
      name: t("plans.free.name"),
      monthlyPrice: plansMetadata.free.monthlyPrice,
      yearlyPrice: 0,
      ctaText: t("plans.free.ctaText"),
      colorClass: plansMetadata.free.colorClass,
      features: [
        { text: t("plans.free.features.0", { credits: 100 }) },
        { text: t("plans.free.features.1", { images: 20 }) },
        { text: t("plans.free.features.2") },
        { text: t("plans.free.features.3") },
        { text: t("plans.free.features.4", { concurrent: 1 }) },
        { text: t("plans.free.features.5") },
        { text: t("plans.free.features.6"), isNotSupported: true },
      ],
    },
    {
      id: "basic",
      name: t("plans.basic.name"),
      monthlyPrice: plansMetadata.basic.monthlyPrice,
      yearlyPrice: getYearlyPrice("basic", plansMetadata.basic.monthlyPrice),
      ctaText: t("plans.basic.ctaText"),
      isPopular: plansMetadata.basic.isPopular,
      colorClass: plansMetadata.basic.colorClass,
      outerColor: plansMetadata.basic.outerColor,
      creemPayProductId: getProductId('basic'),
      features: (() => {
        const config = getCreditsConfig('basic');
        return [
          { text: t("plans.basic.features.0", { credits: config.credits }) },
          { text: t("plans.basic.features.1", { images: config.max_images_per_month }) },
          { text: t("plans.basic.features.2", { videos: config.max_videos_per_month }) },
          { text: t("plans.basic.features.3") },
          { text: t("plans.basic.features.4") },
          { text: t("plans.basic.features.5", { imageConcurrent: config.image_concurrent }) },
          { text: t("plans.basic.features.6", { videoConcurrent: config.video_concurrent }) },
          { text: t("plans.basic.features.7", { support: "7×24" }) },
        ];
      })(),
    },
    {
      id: "plus",
      name: t("plans.plus.name"),
      monthlyPrice: plansMetadata.plus.monthlyPrice,
      yearlyPrice: getYearlyPrice("plus", plansMetadata.plus.monthlyPrice),
      ctaText: t("plans.plus.ctaText"),
      colorClass: plansMetadata.plus.colorClass,
      creemPayProductId: getProductId('plus'),
      features: (() => {
        const config = getCreditsConfig('plus');
        return [
          { text: t("plans.plus.features.0", { credits: config.credits }) },
          { text: t("plans.plus.features.1", { images: config.max_images_per_month }) },
          { text: t("plans.plus.features.2", { videos: config.max_videos_per_month }) },
          { text: t("plans.plus.features.3") },
          { text: t("plans.plus.features.4") },
          { text: t("plans.plus.features.5", { imageConcurrent: config.image_concurrent }) },
          { text: t("plans.plus.features.6", { videoConcurrent: config.video_concurrent }) },
          { text: t("plans.plus.features.7", { support: "7×24" }) },
        ];
      })(),
    },
    {
      id: "pro",
      name: t("plans.pro.name"),
      monthlyPrice: plansMetadata.pro.monthlyPrice,
      yearlyPrice: getYearlyPrice("pro", plansMetadata.pro.monthlyPrice),
      ctaText: t("plans.pro.ctaText"),
      isSpecialOffer: true,
      colorClass: plansMetadata.pro.colorClass,
      outerColor: plansMetadata.pro.outerColor,
      creemPayProductId: getProductId('pro'),
      features: (() => {
        const config = getCreditsConfig('pro');
        return [
          { text: t("plans.pro.features.0", { credits: config.credits }) },
          { text: t("plans.pro.features.1", { images: config.max_images_per_month }) },
          { text: t("plans.pro.features.2", { videos: config.max_videos_per_month }) },
          { text: t("plans.pro.features.3") },
          { text: t("plans.pro.features.4") },
          { text: t("plans.pro.features.5", { imageConcurrent: config.image_concurrent }) },
          { text: t("plans.pro.features.6", { videoConcurrent: config.video_concurrent }) },
          { text: t("plans.pro.features.7", { support: "7×24" }) },
          { text: t("plans.pro.features.8") },
        ];
      })(),
    },
  ];
}
