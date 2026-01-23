"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/store/useUserStore";
import { PricingCard } from "./PricingCard";
import { createBillingCycles, createPricingPlans } from "./data";
import type { BillingCycle } from "./types";
import { CreditPacks } from "@/components/pricing/CreditPacks";

interface PricingProps {
  className?: string;
}

export function Pricing({ className = "" }: PricingProps) {
  const t = useTranslations("pricing");
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentSubscriptionPlanType, setCurrentSubscriptionPlanType] =
    useState<string | null>(null);

  const pricingUser = user ? { ...user, name: user.name ?? undefined } : null;

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function fetchCurrentSubscription() {
      try {
        const response = await fetch("/api/subscription/current");
        const result = await response.json();

        if (result.success && result.data?.planType) {
          setCurrentSubscriptionPlanType(result.data.planType);
        } else {
          setCurrentSubscriptionPlanType(null);
        }
      } catch (error) {
        console.error("Failed to fetch current subscription:", error);
        setCurrentSubscriptionPlanType(null);
      }
    }

    fetchCurrentSubscription();
  }, [isAuthenticated, user]);

  const billingCycles = useMemo(() => createBillingCycles(t), [t]);

  const pricingPlans = useMemo(() => {
    if (billingCycle === "onetime") return [];
    return createPricingPlans(t, billingCycle as "monthly" | "yearly");
  }, [t, billingCycle]);

  const resolvedSubscriptionPlanType =
    isAuthenticated && user ? currentSubscriptionPlanType : null;

  const isCurrentPlan = (planId: string): boolean => {
    if (!resolvedSubscriptionPlanType) return false;
    return resolvedSubscriptionPlanType === `${billingCycle}_${planId}`;
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
                    {t("billingCycle.save")} {cycle.savePercent}%
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
          <CreditPacks user={pricingUser} />
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
                user={pricingUser}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="inline-block px-4 py-2 rounded-lg border border-muted-foreground/20 text-muted-foreground text-xs font-medium tracking-wide bg-background">
              {t("footer.guarantee")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
