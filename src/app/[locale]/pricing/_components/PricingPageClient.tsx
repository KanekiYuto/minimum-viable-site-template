"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { siteConfig } from "@/config/site";
import { PAYMENT_CONFIG } from "@/shared/payment/config";
import {
  PRICING_PLANS_METADATA,
  YEARLY_DISCOUNT_PERCENT,
  CREDIT_PACKS,
  getSubscriptionCreditsConfig,
  getCreemPayProductId,
  getCreemPayCreditPackProductId,
  calculateYearlyPrice,
  CREDIT_PACK_ACCENT_COLORS_BY_NAME,
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

export default function PricingPageClient() {
  const tPricing = useTranslations("pricing");
  const tCard = useTranslations("pricing.card");
  const tPacks = useTranslations("pricing.packs");
  const tPayment = useTranslations("pricing.payment");
  const tFaq = useTranslations("pricing.faq");
  const { user, isAuthenticated } = useUserStore();
  const [currentSubscriptionPlanType, setCurrentSubscriptionPlanType] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCurrentSubscriptionPlanType(null);
      return;
    }

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

  const pricingUser: PricingUser = user
    ? { id: user.id, email: user.email, name: user.name ?? undefined }
    : null;

  const billingCycles = useMemo<BillingCycleConfig[]>(
    () => [
      { id: "monthly", label: tPricing("billingCycle.monthly") },
      { id: "yearly", label: tPricing("billingCycle.yearly"), savePercent: YEARLY_DISCOUNT_PERCENT },
      { id: "onetime", label: tPricing("billingCycle.onetime") },
    ],
    [tPricing],
  );

  const subscriptionPlansByCycle = useMemo(() => {
    const buildSubscriptionPlans = (
      billingCycle: "monthly" | "yearly",
    ): SubscriptionPricingPlan[] => {
      const getCreditsConfig = (planId: string) => {
        const key =
          billingCycle === "yearly" ? `yearly_${planId}` : `monthly_${planId}`;
        return getSubscriptionCreditsConfig(key);
      };

      const getProductId = (planId: string) => {
        const key =
          billingCycle === "yearly" ? `yearly_${planId}` : `monthly_${planId}`;
        return getCreemPayProductId(key);
      };

      const getYearlyPrice = (planId: string, monthlyPrice: number) => {
        const yearlyKey = `yearly_${planId}`;
        const yearlyPrice = PAYMENT_CONFIG.subscriptions[yearlyKey]?.price;
        return typeof yearlyPrice === "number"
          ? yearlyPrice
          : calculateYearlyPrice(monthlyPrice);
      };

      return [
      {
        id: "free",
        name: tPricing("plans.free.name"),
        monthlyPrice: PRICING_PLANS_METADATA.free.monthlyPrice,
        yearlyPrice: 0,
        ctaText: tPricing("plans.free.ctaText"),
        colorClass: PRICING_PLANS_METADATA.free.colorClass,
        features: [
          { text: tPricing("plans.free.features.0", { credits: 100 }) },
          { text: tPricing("plans.free.features.1", { images: 20 }) },
          { text: tPricing("plans.free.features.2") },
          { text: tPricing("plans.free.features.3") },
          { text: tPricing("plans.free.features.4", { concurrent: 1 }) },
          { text: tPricing("plans.free.features.5") },
          { text: tPricing("plans.free.features.6"), isNotSupported: true },
        ],
      },
      {
        id: "basic",
        name: tPricing("plans.basic.name"),
        monthlyPrice: PRICING_PLANS_METADATA.basic.monthlyPrice,
        yearlyPrice: getYearlyPrice("basic", PRICING_PLANS_METADATA.basic.monthlyPrice),
        ctaText: tPricing("plans.basic.ctaText"),
        isPopular: PRICING_PLANS_METADATA.basic.isPopular,
        colorClass: PRICING_PLANS_METADATA.basic.colorClass,
        outerColor: PRICING_PLANS_METADATA.basic.outerColor,
        productId: getProductId("basic"),
        features: (() => {
          const config = getCreditsConfig("basic");
          return [
            { text: tPricing("plans.basic.features.0", { credits: config.credits }) },
            { text: tPricing("plans.basic.features.1", { images: config.max_images_per_month }) },
            { text: tPricing("plans.basic.features.2", { videos: config.max_videos_per_month }) },
            { text: tPricing("plans.basic.features.3") },
            { text: tPricing("plans.basic.features.4") },
            { text: tPricing("plans.basic.features.5", { imageConcurrent: config.image_concurrent }) },
            { text: tPricing("plans.basic.features.6", { videoConcurrent: config.video_concurrent }) },
            { text: tPricing("plans.basic.features.7", { support: "7×24" }) },
          ];
        })(),
      },
      {
        id: "plus",
        name: tPricing("plans.plus.name"),
        monthlyPrice: PRICING_PLANS_METADATA.plus.monthlyPrice,
        yearlyPrice: getYearlyPrice("plus", PRICING_PLANS_METADATA.plus.monthlyPrice),
        ctaText: tPricing("plans.plus.ctaText"),
        colorClass: PRICING_PLANS_METADATA.plus.colorClass,
        productId: getProductId("plus"),
        features: (() => {
          const config = getCreditsConfig("plus");
          return [
            { text: tPricing("plans.plus.features.0", { credits: config.credits }) },
            { text: tPricing("plans.plus.features.1", { images: config.max_images_per_month }) },
            { text: tPricing("plans.plus.features.2", { videos: config.max_videos_per_month }) },
            { text: tPricing("plans.plus.features.3") },
            { text: tPricing("plans.plus.features.4") },
            { text: tPricing("plans.plus.features.5", { imageConcurrent: config.image_concurrent }) },
            { text: tPricing("plans.plus.features.6", { videoConcurrent: config.video_concurrent }) },
            { text: tPricing("plans.plus.features.7", { support: "7×24" }) },
          ];
        })(),
      },
      {
        id: "pro",
        name: tPricing("plans.pro.name"),
        monthlyPrice: PRICING_PLANS_METADATA.pro.monthlyPrice,
        yearlyPrice: getYearlyPrice("pro", PRICING_PLANS_METADATA.pro.monthlyPrice),
        ctaText: tPricing("plans.pro.ctaText"),
        isSpecialOffer: true,
        colorClass: PRICING_PLANS_METADATA.pro.colorClass,
        outerColor: PRICING_PLANS_METADATA.pro.outerColor,
        productId: getProductId("pro"),
        features: (() => {
          const config = getCreditsConfig("pro");
          return [
            { text: tPricing("plans.pro.features.0", { credits: config.credits }) },
            { text: tPricing("plans.pro.features.1", { images: config.max_images_per_month }) },
            { text: tPricing("plans.pro.features.2", { videos: config.max_videos_per_month }) },
            { text: tPricing("plans.pro.features.3") },
            { text: tPricing("plans.pro.features.4") },
            { text: tPricing("plans.pro.features.5", { imageConcurrent: config.image_concurrent }) },
            { text: tPricing("plans.pro.features.6", { videoConcurrent: config.video_concurrent }) },
            { text: tPricing("plans.pro.features.7", { support: "7×24" }) },
            { text: tPricing("plans.pro.features.8") },
          ];
        })(),
      },
    ];
    };

    return {
      monthly: buildSubscriptionPlans("monthly"),
      yearly: buildSubscriptionPlans("yearly"),
    };
  }, [tPricing]);

  const creditPacks = useMemo<CreditPackPlan[]>(() => {
    return CREDIT_PACKS.map((pack) => {
      const maybeBonusRate = (pack as unknown as { bonusRate?: unknown })
        .bonusRate;
      const bonusRate = typeof maybeBonusRate === "number" ? maybeBonusRate : undefined;

      return {
        id: pack.id,
        name: pack.name,
        price: pack.price,
        credits: pack.credits,
        validDays: pack.validDays,
        bonusRate,
        productId: getCreemPayCreditPackProductId(pack.id),
        accentColor:
          CREDIT_PACK_ACCENT_COLORS_BY_NAME[pack.name.toLowerCase()] || undefined,
      };
    });
  }, []);

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
      // { id: "more", name: "More", image: "/payments/more.webp" },
    ],
    [],
  );

  const pricingLabels = useMemo<PricingLabels>(
    () => ({
      billingCycleSaveLabel: tPricing("billingCycle.save"),
      guaranteeText: tPricing("footer.guarantee"),
    }),
    [tPricing],
  );

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

  const paymentIconsLabels = useMemo<PaymentIconsLabels>(
    () => ({
      securePayment: tPayment("securePayment"),
      noPaymentMethod: tPayment("noPaymentMethod"),
      contactUs: tPayment("contactUs"),
      emailSubject: tPayment("emailSubject"),
    }),
    [tPayment],
  );

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
