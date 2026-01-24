"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { siteConfig } from "@/config/site";
import { PAYMENT_CONFIG } from "@/shared/payment/config";
import { buildSubscriptionPlanType } from "@/shared/payment/config/subscription-key";
import {
  PRICING_PLANS_METADATA,
  PRICING_PLAN_ORDER,
  YEARLY_DISCOUNT_PERCENT,
  CREDIT_PACKS,
  getSubscriptionCreditsConfig,
  getCreemPayProductId,
  getCreemPayCreditPackProductId,
  calculateYearlyPrice,
  CREDIT_PACK_ACCENT_COLORS_BY_NAME,
  getPlanDisabledFeatureIndexes,
} from "@/shared/payment/config/payment";
import {
  PaymentIcons,
  Pricing,
  PricingFAQ,
  type BillingCycleConfig,
  type CreditPackPlan,
  type CreditPacksLabels,
  type PricingCardLabels,
  type PricingLabels,
  type PaymentIconsLabels,
  type SubscriptionPricingPlan,
  type PaymentIconMethod,
  type PricingUser,
} from "@extensions/payment/components/pricing";

/**
 * Pricing 页面（Client Component）
 *
 * - 负责：从配置构造展示数据 + 组装 i18n 文案，并注入到 `extensions/payment` 组件
 * - 不负责：支付运行时逻辑（checkout/webhook 等），这些在 `extensions/payment/core`
 *
 * 约束：`extensions/payment/components/**` 内不做国际化，这里集中处理 `useTranslations(...)`。
 */
export default function PricingPageClient() {
  // i18n：按子模块拆分，便于给不同组件注入各自所需文案
  const tPricing = useTranslations("pricing");
  const tCard = useTranslations("pricing.card");
  const tPacks = useTranslations("pricing.packs");
  const tPayment = useTranslations("pricing.payment");
  const tFaq = useTranslations("pricing.faq");

  // 用户态：用于 CTA 状态（登录/当前方案）与拉取当前订阅信息
  const { user, isAuthenticated } = useUserStore();

  // 当前订阅方案类型：形如 `${billingCycle}_${planId}`，用于 PricingCard 的“当前方案”展示
  const [currentSubscriptionPlanType, setCurrentSubscriptionPlanType] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCurrentSubscriptionPlanType(null);
      return;
    }

    // 登录后查询当前订阅（避免在扩展组件内做数据请求）
    async function fetchCurrentSubscription() {
      try {
        const response = await fetch("/api/subscription/current");
        const result = await response.json();
        setCurrentSubscriptionPlanType(result.success ? result.data?.planType ?? null : null);
      } catch {
        setCurrentSubscriptionPlanType(null);
      }
    }

    fetchCurrentSubscription();
  }, [isAuthenticated, user]);

  // 注入到 pricing 组件的最小用户信息
  const pricingUser: PricingUser = user
    ? { id: user.id, email: user.email, name: user.name ?? undefined }
    : null;

  // 计费周期切换（订阅：月/年；一次性：点数包）
  const billingCycles = useMemo<BillingCycleConfig[]>(
    () => [
      { id: "monthly", label: tPricing("billingCycle.monthly") },
      { id: "yearly", label: tPricing("billingCycle.yearly"), savePercent: YEARLY_DISCOUNT_PERCENT },
      { id: "onetime", label: tPricing("billingCycle.onetime") },
    ],
    [tPricing],
  );

  // 从配置构造订阅套餐（含 UI 展示用文案/feature 文本）
  const subscriptionPlansByCycle = useMemo(() => {
    const buildSubscriptionPlans = (
      billingCycle: "monthly" | "yearly",
    ): SubscriptionPricingPlan[] => {
      const getPlanKey = (planId: string) =>
        buildSubscriptionPlanType(billingCycle, planId);

      const getProductId = (planId: string) => getCreemPayProductId(getPlanKey(planId));

      const getCreditsConfig = (planId: string) => getSubscriptionCreditsConfig(getPlanKey(planId));

      const getYearlyPrice = (planId: string, monthlyPrice: number) => {
        const yearlyKey = buildSubscriptionPlanType("yearly", planId);
        const yearlyPrice = PAYMENT_CONFIG.subscriptions[yearlyKey]?.price;
        return typeof yearlyPrice === "number" ? yearlyPrice : calculateYearlyPrice(monthlyPrice);
      };

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
        const meta = PRICING_PLANS_METADATA[planId] || PRICING_PLANS_METADATA.free;

        if (planId === "free") {
          return {
            id: "free",
            name: tPricing("plans.free.name"),
            monthlyPrice: meta.monthlyPrice,
            yearlyPrice: 0,
            ctaText: tPricing("plans.free.ctaText"),
            colorClass: meta.colorClass,
            features: buildFeatures("free", {
              credits: 100,
              images: 20,
              concurrent: 1,
            }),
          };
        }

        const config = getCreditsConfig(planId);

        return {
          id: planId,
          name: tPricing(`plans.${planId}.name`),
          monthlyPrice: meta.monthlyPrice,
          yearlyPrice: getYearlyPrice(planId, meta.monthlyPrice),
          ctaText: tPricing(`plans.${planId}.ctaText`),
          ...(meta.isPopular ? { isPopular: true } : {}),
          ...(meta.isSpecialOffer ? { isSpecialOffer: true } : {}),
          colorClass: meta.colorClass,
          outerColor: meta.outerColor,
          productId: getProductId(planId),
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
      monthly: buildSubscriptionPlans("monthly"),
      yearly: buildSubscriptionPlans("yearly"),
    };
  }, [tPricing]);

  // 从配置构造点数包（一次性购买）
  const creditPacks = useMemo<CreditPackPlan[]>(() => {
    return CREDIT_PACKS.map((pack) => {
      return {
        id: pack.id,
        name: pack.name,
        price: pack.price,
        credits: pack.credits,
        validDays: pack.validDays,
        bonusRate: pack.bonusRate,
        productId: getCreemPayCreditPackProductId(pack.id),
        accentColor:
          CREDIT_PACK_ACCENT_COLORS_BY_NAME[pack.name.toLowerCase()] || undefined,
      };
    });
  }, []);

  // 支付方式图标：使用 `public/payments/*`（文件名小写、无 pay_ 前缀）
  const paymentIconMethods = useMemo<PaymentIconMethod[]>(
    () => [
      { id: "mastercard", name: "Mastercard", image: "/payments/mastercard.webp" },
      { id: "visa", name: "Visa", image: "/payments/visa.webp" },
      { id: "amex", name: "American Express", image: "/payments/american_express.webp" },
      { id: "applepay", name: "Apple Pay", image: "/payments/apple_pay.webp" },
      { id: "china_unionpay", name: "China UnionPay", image: "/payments/china_unionpay.webp" },
      { id: "googlepay", name: "Google Pay", image: "/payments/google_pay.webp" },
      { id: "jcbi", name: "JCB International", image: "/payments/jcbi.webp" },
      { id: "discover", name: "Discover", image: "/payments/discover.webp" },
      { id: "paypal", name: "PayPal", image: "/payments/paypal.webp" },
      { id: "click_to_pay", name: "Click to Pay", image: "/payments/click_to_pay.webp" },
      { id: "bancontact", name: "Bancontact", image: "/payments/bancontact.webp" },
      { id: "sepa_direct_debit", name: "SEPA Direct Debit", image: "/payments/sepa_direct_debit.webp" },
      { id: "link", name: "Link by Stripe", image: "/payments/link.webp" },
      { id: "ideal", name: "iDEAL", image: "/payments/ideal.webp" },
      { id: "diners_club", name: "Diners Club", image: "/payments/diners_club.webp" },
      { id: "truelayer", name: "TrueLayer", image: "/payments/truelayer.webp" },
      { id: "cash_app_pay", name: "Cash App Pay", image: "/payments/cash_app_pay.webp" },
      { id: "eftpos", name: "Eftpos", image: "/payments/eftpos.webp" },
      { id: "revolut_pay", name: "Revolut Pay", image: "/payments/revolut_pay.webp" },
      { id: "more", name: "More", image: "/payments/more.webp" },
    ],
    [],
  );

  // 注入到扩展组件的通用文案（避免扩展组件直接依赖 next-intl）
  const pricingLabels = useMemo<PricingLabels>(
    () => ({
      billingCycleSaveLabel: tPricing("billingCycle.save"),
      guaranteeText: tPricing("footer.guarantee"),
    }),
    [tPricing],
  );

  // PricingCard 文案
  const pricingCardLabels = useMemo<PricingCardLabels>(
    () => ({
      billingCycle: {
        monthly: tCard("billingCycle.monthly"),
        yearly: tCard("billingCycle.yearly"),
      },
      mostPopular: tCard("mostPopular"),
      bestValue: tCard("bestValue"),
      loginRequired: tCard("loginRequired"),
      currentPlan: tCard("currentPlan"),
      configuring: tCard("configuring"),
      processing: tCard("processing"),
    }),
    [tCard],
  );

  // CreditPacks 文案 + 富文本渲染器（承接 t.rich）
  const creditPacksLabels = useMemo<CreditPacksLabels>(
    () => ({
      title: tPacks("title"),
      hint: tPacks("hint"),
      loginRequired: tPacks("loginRequired"),
      configuring: tPacks("configuring"),
      processing: tPacks("processing"),
      cta: tPacks("cta"),
      groupTitle: (days) => tPacks("groupTitle", { days }),
      bonusRate: (percent) => tPacks("bonusRate", { percent }),
      credits: (credits) => tPacks("credits", { credits }),
      miniMarketing: (base) => tPacks("marketing.mini", { base }),
      renderCreditsPromo: ({ base, bonus, Tag }) =>
        tPacks.rich("creditsPromo", {
          base,
          bonus,
          tag: (chunks) => <Tag>{chunks}</Tag>,
        }),
    }),
    [tPacks],
  );

  // PaymentIcons 文案
  const paymentIconsLabels = useMemo<PaymentIconsLabels>(
    () => ({
      securePayment: tPayment("securePayment"),
      noPaymentMethod: tPayment("noPaymentMethod"),
      contactUs: tPayment("contactUs"),
      emailSubject: tPayment("emailSubject"),
    }),
    [tPayment],
  );

  // FAQ 条目在页面层组装（扩展组件只负责渲染）
  const faqItems = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        question: tFaq(`items.${i}.question`, { siteName: siteConfig.name }),
        answer: tFaq(`items.${i}.answer`, { siteName: siteConfig.name }),
      })),
    [tFaq],
  );

  return (
    <div className="min-h-screen">
      <div className="py-16 px-4 md:px-6 lg:px-8 ">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {tPricing("header.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {tPricing("header.description")}
          </p>
        </motion.div>

        <Pricing
          user={pricingUser}
          billingCycles={billingCycles}
          subscriptionPlansByCycle={subscriptionPlansByCycle}
          creditPacks={creditPacks}
          currentSubscriptionPlanType={currentSubscriptionPlanType}
          labels={pricingLabels}
          cardLabels={pricingCardLabels}
          creditPacksLabels={creditPacksLabels}
        />
      </div>

      {/* 支付方式图标 */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <PaymentIcons
            methods={paymentIconMethods}
            supportEmail={siteConfig.contact?.email}
            labels={paymentIconsLabels}
          />
        </div>
      </div>

      {/* FAQ 部分 */}
      <PricingFAQ title={tFaq("title")} items={faqItems} />
    </div>
  );
}
