"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createPaymentCheckout } from "../../core/client";
import type { CreditPackPlan, PricingUser } from "./types";

export type CreditPacksLabels = {
  title: string;
  hint: string;
  loginRequired: string;
  configuring: string;
  processing: string;
  cta: string;
  groupTitle: (days: number) => string;
  bonusRate: (percent: number) => string;
  credits: (credits: string) => string;
  miniMarketing: (base: string) => string;
  renderCreditsPromo: (args: {
    base: string;
    bonus: string;
    Tag: (props: { children: ReactNode }) => ReactNode;
  }) => ReactNode;
};

interface CreditPacksProps {
  packs: CreditPackPlan[];
  user?: PricingUser;
  labels: CreditPacksLabels;
}

export function CreditPacks({ packs, user, labels }: CreditPacksProps) {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  const groupedPacks = useMemo(() => {
    const groups = new Map<number, CreditPackPlan[]>();
    packs.forEach((pack) => {
      if (!groups.has(pack.validDays)) groups.set(pack.validDays, []);
      groups.get(pack.validDays)?.push(pack);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [packs]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      Math.round(value)
    );

  const formatCredits = (value: number) => {
    const absValue = Math.abs(value);
    const formatWithUnit = (amount: number, unit: "k" | "w") => {
      const rounded = Math.round(amount * 10) / 10;
      return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}${unit}`;
    };

    if (absValue >= 10000) return formatWithUnit(value / 10000, "w");
    if (absValue >= 1000) return formatWithUnit(value / 1000, "k");
    return `${value}`;
  };

  const startCheckout = async (pack: CreditPackPlan) => {
    if (!user || !pack.productId) return;

    setLoadingPackId(pack.id);
    try {
      const { checkoutUrl } = await createPaymentCheckout({
        productId: pack.productId,
        type: "one-time",
        metadata: {
          userId: user.id,
          packId: pack.id,
          source: "pricing",
        },
        customer: {
          email: user.email,
        },
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } finally {
      setLoadingPackId(null);
    }
  };

  const getButtonLabel = (pack: CreditPackPlan, isLoading: boolean) => {
    if (!user) return labels.loginRequired;
    if (!pack.productId) return labels.configuring;
    if (isLoading) return labels.processing;
    return labels.cta;
  };

  const getButtonClassName = (disabled: boolean) =>
    `w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
      disabled
        ? "bg-white/20 text-white cursor-not-allowed"
        : "bg-white text-black hover:bg-white/90 cursor-pointer"
    }`;

  const getPromoLabel = (
    baseCredits: number,
    bonusCredits: number,
    isPricing: boolean
  ) => {
    const tagClassName = isPricing
      ? "inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm mx-1"
      : "inline-flex items-center px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold text-xs md:text-xs lg:text-sm mx-1";

    const Tag = ({ children }: { children: ReactNode }) => (
      <span className={tagClassName}>{children}</span>
    );

    return labels.renderCreditsPromo({
      base: formatCredits(baseCredits),
      bonus: formatCredits(bonusCredits),
      Tag,
    });
  };

  const getMiniMarketingLabel = (baseCredits: number) =>
    labels.miniMarketing(formatCredits(baseCredits));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">{labels.title}</h2>
        <span className="text-xs text-muted-foreground">{labels.hint}</span>
      </div>

      <div className="space-y-5">
        {groupedPacks.map(([days, items]) => (
          <div key={days} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-muted/30 bg-transparent px-3 py-1.5 text-sm font-medium text-foreground/80">
                {labels.groupTitle(days)}
              </span>
              <div className="h-px flex-1 border-t-2 border-dashed border-muted/30" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {items.map((pack) => {
                const isLoading = loadingPackId === pack.id;
                const buttonDisabled = !user || !pack.productId || isLoading;
                const buttonLabel = getButtonLabel(pack, isLoading);

                const bonusPercent = Math.round((pack.bonusRate ?? 0) * 100);
                const shouldShowBonus = bonusPercent > 0;

                const baseCredits = shouldShowBonus
                  ? Math.round(pack.credits / (1 + (pack.bonusRate ?? 0)))
                  : pack.credits;
                const bonusCredits = Math.max(0, pack.credits - baseCredits);

                return (
                  <div key={pack.id} className="relative h-full">
                    <div
                      className={`relative h-full rounded-2xl p-[3px] flex flex-col ${
                        pack.accentColor || "bg-[#3A86FF]"
                      }`}
                    >
                      <div className="rounded-xl overflow-hidden bg-[#0F0F0F] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.0)_100%)] flex flex-col flex-1">
                        <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full">
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                              {pack.name}
                            </h3>
                            {shouldShowBonus && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm whitespace-nowrap">
                                {labels.bonusRate(bonusPercent)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between gap-3 mb-4">
                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                              ${formatPrice(pack.price)}
                            </div>
                            <div className="text-xs md:text-sm lg:text-lg text-white/70">
                              {labels.credits(formatCredits(pack.credits))}
                            </div>
                          </div>

                          {shouldShowBonus ? (
                            <div className="mb-6 text-xs md:text-sm lg:text-base text-white/70">
                              {getPromoLabel(baseCredits, bonusCredits, true)}
                            </div>
                          ) : pack.name.toLowerCase() === "mini" ? (
                            <div className="mb-6 text-xs md:text-sm lg:text-base text-white/70">
                              {getMiniMarketingLabel(baseCredits)}
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => startCheckout(pack)}
                            disabled={buttonDisabled}
                            className={`${getButtonClassName(
                              buttonDisabled
                            )} mt-auto`}
                          >
                            {buttonLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
