"use client";

import { Check, X, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PricingFeature, SubscriptionPricingPlan } from "./types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type PricingCardLabels = {
  billingCycle: Record<"monthly" | "yearly", string>;
  mostPopular: string;
  bestValue: string;
  loginRequired: string;
  currentPlan: string;
  configuring: string;
  processing: string;
};

interface PricingCardProps {
  /** 定价方案 */
  plan: SubscriptionPricingPlan;
  /** 计费周期 */
  billingCycle: "monthly" | "yearly";
  /** 年付节省百分比（0-100，如 20 表示节省 20%） */
  savePercent?: number;
  /** 是否为当前方案 */
  isCurrent?: boolean;
  /** 用户信息 */
  user?: { id: string; email: string; name?: string } | null;
  freePlanHref?: string;
  labels: PricingCardLabels;
  onSubscribe?: (args: {
    planId: string;
    billingCycle: "monthly" | "yearly";
  }) => Promise<void> | void;
}

const POPULAR_BADGE_ICON = (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className="w-3 md:w-3 lg:w-4 h-3 md:h-3 lg:h-4"
  >
    <path
      fill="currentColor"
      d="M9.382 8.912h5.236L12.14 4h-.28L9.382 8.912ZM11.299 20v-9.684H3.234L11.299 20Zm1.402 0 8.065-9.684h-8.065V20Zm3.46-11.088H21L19.06 5.03a2.058 2.058 0 0 0-.69-.748A1.743 1.743 0 0 0 17.4 4h-3.67l2.431 4.912ZM3 8.912h4.839L10.27 4H6.6c-.358 0-.682.094-.97.28a2.057 2.057 0 0 0-.69.75L3 8.911Z"
    ></path>
  </svg>
);

/**
 * 解析特性文本中的 `[[value]]` 标记
 */
function parseFeatureText(text: string) {
  const parts: (string | { type: "tag"; value: string })[] = [];
  let remaining = text;

  while (true) {
    const openIndex = remaining.indexOf("[[");
    if (openIndex === -1) {
      if (remaining.length > 0) {
        parts.push(remaining);
      }
      break;
    }

    if (openIndex > 0) {
      parts.push(remaining.substring(0, openIndex));
    }

    const closeIndex = remaining.indexOf("]]", openIndex + 2);
    if (closeIndex === -1) {
      parts.push(remaining.substring(openIndex));
      break;
    }

    const tagValue = remaining.substring(openIndex + 2, closeIndex);
    parts.push({ type: "tag", value: tagValue });
    remaining = remaining.substring(closeIndex + 2);
  }

  return parts.map((part, i) => {
    if (typeof part === "object") {
      return (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm mx-1"
        >
          {part.value}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * 价格显示组件
 */
function PriceSection({
  billingCycle,
  price,
  originalPrice,
  labels,
}: {
  billingCycle: "monthly" | "yearly";
  price: number;
  originalPrice: number;
  labels: PricingCardLabels;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        {originalPrice > 0 && (
          <span className="text-white/60 line-through text-sm md:text-lg lg:text-2xl">
            ${originalPrice.toFixed(0)}
          </span>
        )}
        <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          ${Math.round(price)}
        </span>
        <span className="text-xs md:text-sm lg:text-lg text-white/70">
          /{labels.billingCycle[billingCycle]}
        </span>
      </div>
    </div>
  );
}

/**
  * 按钮（CTA）组件
 */
function CTAButton({
  plan,
  user,
  isCurrent,
  isLoading,
  onPaymentClick,
  freePlanHref,
  labels,
}: {
  plan: SubscriptionPricingPlan;
  user?: { id: string; email: string; name?: string } | null;
  isCurrent: boolean;
  isLoading: boolean;
  onPaymentClick?: () => void;
  freePlanHref: string;
  labels: PricingCardLabels;
}) {
  const router = useRouter();

  const baseProps = {
    variant: "payment" as const,
    size: "xl" as const,
    className: "mb-8",
  };

  if (plan.id === "free") {
    return (
      <Button
        {...baseProps}
        onClick={() => {
          if (!isCurrent) router.push(freePlanHref);
        }}
      >
        {isCurrent ? labels.currentPlan : plan.ctaText}
      </Button>
    );
  }

  if (!user) {
    return (
      <Button {...baseProps} disabled>
        {labels.loginRequired}
      </Button>
    );
  }

  if (isCurrent) {
    return (
      <Button {...baseProps} disabled>
        {labels.currentPlan}
      </Button>
    );
  }

  if (!onPaymentClick) {
    return (
      <Button {...baseProps} disabled>
        {labels.configuring}
      </Button>
    );
  }

  return (
    <Button
      {...baseProps}
      disabled={isLoading}
      onClick={onPaymentClick}
    >
      {isLoading ? <Spinner /> : null}
      {isLoading ? labels.processing : plan.ctaText}
    </Button>
  );
}

/**
 * 功能项组件
 */
function FeatureItem({ feature }: { feature: PricingFeature }) {
  return (
    <div className="flex items-start gap-3">
      {feature.isNotSupported ? (
        <X className="w-4 md:w-4 lg:w-5 h-4 md:h-4 lg:h-5 text-white/40 flex-shrink-0 mt-0.5" />
      ) : (
        <Check className="w-4 md:w-4 lg:w-5 h-4 md:h-4 lg:h-5 text-white flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 flex items-center justify-between gap-2">
        <span
          className={`text-xs md:text-sm lg:text-base leading-relaxed ${feature.isNotSupported ? "text-white/40" : "text-white"
            }`}
        >
          {parseFeatureText(feature.text)}
        </span>
        <div className="flex items-center gap-2">
          {feature.isUnlimited && (
            <span className="bg-yellow-400 text-black text-xs md:text-xs lg:text-sm font-bold px-2 py-0.5 rounded">
              UNLIMITED
            </span>
          )}
          {feature.hasTooltip && (
            <HelpCircle className="w-3 md:w-3 lg:w-4 h-3 md:h-3 lg:h-4 text-white/40 flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 卡片内容组件
 */
function CardContent({
  plan,
  billingCycle,
  price,
  originalPrice,
  user,
  isCurrent,
  isLoading,
  onPaymentClick,
  freePlanHref,
  labels,
}: {
  plan: SubscriptionPricingPlan;
  billingCycle: "monthly" | "yearly";
  price: number;
  originalPrice: number;
  user?: { id: string; email: string; name?: string } | null;
  isCurrent: boolean;
  isLoading: boolean;
  onPaymentClick?: () => void;
  freePlanHref: string;
  labels: PricingCardLabels;
}) {
  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full">
      {/* 方案名称 */}
      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
        {plan.name}
      </h3>

      {/* 价格 */}
      <PriceSection
        billingCycle={billingCycle}
        price={price}
        originalPrice={originalPrice}
        labels={labels}
      />

      {/* CTA 按钮 */}
      <CTAButton
        plan={plan}
        user={user}
        isCurrent={isCurrent}
        isLoading={isLoading}
        onPaymentClick={onPaymentClick}
        freePlanHref={freePlanHref}
        labels={labels}
      />

      {/* 功能列表 */}
      <div className="space-y-3 flex-1">
        {plan.features.map((feature, index) => (
          <FeatureItem key={index} feature={feature} />
        ))}
      </div>
    </div>
  );
}

/**
 * 定价卡片组件
 */
export function PricingCard({
  plan,
  billingCycle,
  savePercent = 0,
  isCurrent = false,
  user,
  freePlanHref = "/",
  labels,
  onSubscribe,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 计算折扣比例
  const discountRate = savePercent / 100;
  const fallbackYearlyPrice = plan.monthlyPrice * 12 * (1 - discountRate);
  const yearlyPrice = plan.yearlyPrice ?? fallbackYearlyPrice;
  const price = billingCycle === "monthly" ? plan.monthlyPrice : yearlyPrice;
  const originalPrice = billingCycle === "yearly" ? plan.monthlyPrice * 12 : 0;

  const handlePaymentClick = () => {
    if (!user || !onSubscribe) {
      return;
    }
    setIsLoading(true);
    Promise.resolve(onSubscribe({ planId: plan.id, billingCycle })).finally(() => {
      setIsLoading(false);
    });
  };

  const cardInnerContent = (
    <div
      className={`rounded-xl overflow-hidden bg-[#0F0F0F] ${plan.colorClass} flex flex-col flex-1`}
    >
      <CardContent
        plan={plan}
        billingCycle={billingCycle}
        price={price}
        originalPrice={originalPrice}
        user={user}
        isCurrent={isCurrent}
        isLoading={isLoading}
        onPaymentClick={onSubscribe ? handlePaymentClick : undefined}
        freePlanHref={freePlanHref}
        labels={labels}
      />
    </div>
  );

  return (
    <div className="relative h-full">
      {plan.isPopular ? (
        <div
          className={`relative h-full rounded-2xl p-[3px] flex flex-col ${plan.outerColor}`}
        >
          {/* 推荐标签 */}
          <span className="text-white text-xs md:text-sm lg:text-base font-semibold px-4 py-3 rounded-full flex items-center justify-center w-full gap-1">
            {POPULAR_BADGE_ICON}
            {labels.mostPopular}
          </span>

          {cardInnerContent}
        </div>
      ) : plan.isSpecialOffer ? (
        <div
          className={`relative h-full rounded-2xl p-[3px] flex flex-col ${plan.outerColor}`}
        >
          {/* 最具性价比标签 */}
          <span className="text-white text-xs md:text-sm lg:text-base font-semibold px-4 py-3 rounded-full flex items-center justify-center w-full gap-1">
            {POPULAR_BADGE_ICON}
            {labels.bestValue}
          </span>

          {cardInnerContent}
        </div>
      ) : (
        <div className="relative h-full rounded-2xl p-[3px] flex flex-col md:pt-[51px]">
          {cardInnerContent}
        </div>
      )}
    </div>
  );
}
