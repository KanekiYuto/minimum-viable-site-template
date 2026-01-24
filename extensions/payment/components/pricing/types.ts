export type BillingCycle = "monthly" | "yearly" | "onetime";

export interface BillingCycleConfig {
  id: BillingCycle;
  label: string;
  savePercent?: number;
}

export type PricingUser = { id: string; email: string; name?: string } | null;

export interface PricingFeature {
  text: string;
  isUnlimited?: boolean;
  isNotSupported?: boolean;
  hasTooltip?: boolean;
  tooltipText?: string;
}

export interface SubscriptionPricingPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  features: PricingFeature[];
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  ctaText: string;
  colorClass: string;
  outerColor?: string;
}

export interface CreditPackPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  validDays: number;
  bonusRate?: number;
  accentColor?: string;
}
