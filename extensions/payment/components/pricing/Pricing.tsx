"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type {
  BillingCycle,
  BillingCycleConfig,
  CreditPackPlan,
  PricingUser,
  SubscriptionPricingPlan,
} from "./types";
import { PricingCard, type PricingCardLabels } from "./PricingCard";
import { CreditPacks, type CreditPacksLabels } from "./CreditPacks";

/**
 * Pricing 组件所需的通用文案（由外部注入）。
 *
 * 注意：`extensions/payment/components/**` 内部不做国际化，
 * 所有文案/富文本都应由 app 层（如 `src/app/**`）传入。
 */
export type PricingLabels = {
  billingCycleSaveLabel: string;
  guaranteeText: string;
};

interface PricingProps {
  /** 外层容器 className */
  className?: string;
  /** 当前登录用户（未登录可传 null/undefined） */
  user?: PricingUser;
  /** 计费周期选项（切换 tab） */
  billingCycles: BillingCycleConfig[];
  /** 订阅套餐（按周期分组） */
  subscriptionPlansByCycle: Record<"monthly" | "yearly", SubscriptionPricingPlan[]>;
  /** 一次性点数包 */
  creditPacks: CreditPackPlan[];
  /** 当前订阅（用于“当前方案”展示）；形如 `${billingCycle}_${planId}` */
  currentSubscriptionPlanType?: string | null;
  /** free 方案跳转地址 */
  freePlanHref?: string;
  /** Pricing 自身使用的文案 */
  labels: PricingLabels;
  /** PricingCard 使用的文案 */
  cardLabels: PricingCardLabels;
  /** CreditPacks 使用的文案/富文本渲染器 */
  creditPacksLabels: CreditPacksLabels;
  onSubscribe?: (args: {
    planId: string;
    billingCycle: "monthly" | "yearly";
  }) => Promise<void> | void;
  onBuyCreditPack?: (pack: CreditPackPlan) => Promise<void> | void;
}

/**
 * 定价区域（订阅套餐 + 点数包）。
 *
 * 组件本身不依赖配置/数据源：套餐数据由外部构造并传入。
 */
export function Pricing({
  className = "",
  user,
  billingCycles,
  subscriptionPlansByCycle,
  creditPacks,
  currentSubscriptionPlanType,
  freePlanHref = "/",
  labels,
  cardLabels,
  creditPacksLabels,
  onSubscribe,
  onBuyCreditPack,
}: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const pricingPlans = useMemo(() => {
    if (billingCycle === "monthly") return subscriptionPlansByCycle.monthly;
    if (billingCycle === "yearly") return subscriptionPlansByCycle.yearly;
    return [];
  }, [billingCycle, subscriptionPlansByCycle]);

  const isCurrentPlan = (planId: string) => {
    if (!currentSubscriptionPlanType) return false;
    return currentSubscriptionPlanType === `${billingCycle}_${planId}`;
  };

  const currentCycle = billingCycles.find((c) => c.id === billingCycle);
  const savePercent = currentCycle?.savePercent || 0;

  return (
    <div className={className}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8 md:mb-12 lg:mb-16"
        >
          <div className="relative inline-flex gap-2 rounded-lg bg-background-1 p-1 border border-background-2">
            {billingCycles.map((cycle) => (
              <motion.button
                key={cycle.id}
                onClick={() => setBillingCycle(cycle.id)}
                className={`
                  relative px-8 py-2.5 rounded-md font-medium text-sm
                  transition-colors cursor-pointer overflow-visible
                  ${
                    billingCycle === cycle.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {cycle.savePercent && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-hover text-white text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap uppercase tracking-wide z-20">
                    {labels.billingCycleSaveLabel} {cycle.savePercent}%
                  </span>
                )}

                {billingCycle === cycle.id && (
                  <motion.div
                    layoutId="billing-cycle-tab"
                    className="absolute inset-0 rounded-md bg-background border border-background-2"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}

                <span className="relative z-10">{cycle.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {billingCycle === "onetime" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="w-full bg-background-1 p-4 rounded-2xl border border-background-2"
        >
          <CreditPacks
            packs={creditPacks}
            user={user}
            labels={creditPacksLabels}
            onBuyPack={onBuyCreditPack}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="w-full bg-background-1 p-4 rounded-2xl border border-background-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                savePercent={savePercent}
                isCurrent={isCurrentPlan(plan.id)}
                user={user}
                freePlanHref={freePlanHref}
                labels={cardLabels}
                onSubscribe={onSubscribe}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="inline-block px-4 py-2 rounded-lg border border-muted-foreground/20 text-muted-foreground text-xs font-medium tracking-wide bg-background">
              {labels.guaranteeText}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
