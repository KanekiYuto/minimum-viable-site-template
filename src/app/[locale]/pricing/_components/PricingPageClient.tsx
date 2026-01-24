"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { createPaymentCheckout } from "@/lib/payment/createPaymentCheckout";
import { buildSubscriptionPlanType } from "@/shared/payment/subscription-key";
import { useUserStore } from "@/store/useUserStore";
import { FAQ } from "@extensions/components/FAQ";
import { PaymentIcons, type PaymentIconMethod, type PaymentIconsLabels } from "@extensions/payment/components/pricing/PaymentIcons";
import { Pricing, type PricingLabels } from "@extensions/payment/components/pricing/Pricing";
import type { CreditPacksLabels } from "@extensions/payment/components/pricing/CreditPacks";
import type { PricingCardLabels } from "@extensions/payment/components/pricing/PricingCard";
import type {
  BillingCycleConfig,
  CreditPackPlan,
  PricingUser,
  SubscriptionPricingPlan,
} from "@extensions/payment/components/pricing/types";
import {
  buildBillingCycles,
  buildCreditPacks,
  buildSubscriptionPlansByCycle,
} from "../_lib/buildPricingData";

export default function PricingPageClient() {
  const tPricing = useTranslations("pricing");
  const tCard = useTranslations("pricing.card");
  const tPacks = useTranslations("pricing.packs");
  const tPayment = useTranslations("pricing.payment");
  const tFaq = useTranslations("pricing.faq");

  const { user, isAuthenticated } = useUserStore();

  const [currentSubscriptionPlanType, setCurrentSubscriptionPlanType] =
    useState<string | null>(null);
  const effectiveCurrentSubscriptionPlanType =
    isAuthenticated && user ? currentSubscriptionPlanType : null;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    async function fetchCurrentSubscription() {
      try {
        const response = await fetch("/api/subscription/current");
        const result = await response.json();
        setCurrentSubscriptionPlanType(
          result.success ? result.data?.planType ?? null : null,
        );
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
    () => buildBillingCycles(tPricing),
    [tPricing],
  );

  const subscriptionPlansByCycle = useMemo<
    Record<"monthly" | "yearly", SubscriptionPricingPlan[]>
  >(() => buildSubscriptionPlansByCycle(tPricing), [tPricing]);

  const creditPacks = useMemo<CreditPackPlan[]>(() => buildCreditPacks(), []);

  const startSubscriptionCheckout = useCallback(
    async (args: { planId: string; billingCycle: "monthly" | "yearly" }) => {
      if (!user) return;

      const sku = buildSubscriptionPlanType(args.billingCycle, args.planId);
      const { checkoutUrl } = await createPaymentCheckout({
        type: "sub",
        sku,
        metadata: {
          userId: user.id,
          planId: args.planId,
          billingCycle: args.billingCycle,
        },
        customer: { email: user.email },
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    },
    [user],
  );

  const startCreditPackCheckout = useCallback(
    async (pack: CreditPackPlan) => {
      if (!user) return;

      const { checkoutUrl } = await createPaymentCheckout({
        type: "one-time",
        sku: pack.id,
        metadata: {
          userId: user.id,
          packId: pack.id,
          source: "pricing",
        },
        customer: { email: user.email },
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    },
    [user],
  );

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
          currentSubscriptionPlanType={effectiveCurrentSubscriptionPlanType}
          labels={pricingLabels}
          cardLabels={pricingCardLabels}
          creditPacksLabels={creditPacksLabels}
          onSubscribe={startSubscriptionCheckout}
          onBuyCreditPack={startCreditPackCheckout}
        />
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <PaymentIcons
            methods={paymentIconMethods}
            supportEmail={siteConfig.contact?.email}
            labels={paymentIconsLabels}
          />
        </div>
      </div>

      <FAQ title={tFaq("title")} items={faqItems} />
    </div>
  );
}

