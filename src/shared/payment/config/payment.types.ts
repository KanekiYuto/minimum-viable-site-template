export type PaymentProvider = 'creem' | 'stripe' | 'paypal';

// 计费周期类型
export type BillingCycle = 'monthly' | 'yearly';

// 方案类型
export type PlanType = 'free' | 'basic' | 'plus' | 'pro';

export interface CreditPackDefinition {
  id: string;
  name: string;
  price: number;
  credits: number;
  validDays: number;
}

export interface SubscriptionDefinition {
  planType: Exclude<PlanType, 'free'>;
  billingCycle: BillingCycle;
  price: number;
  credits: number;
  periodMonths: number;
  concurrency: {
    image: number;
    video: number;
  };
}

// 定价方案元数据
export interface PricingPlanMetadata {
  id: PlanType;
  monthlyPrice: number;
  isPopular?: boolean;
  outerColor?: string;
  colorClass: string;
}

// 定价层级接口
export interface PricingTier {
  planType: PlanType;
  subscriptionPlanType: string;
}

export type CreditPack = CreditPackDefinition;

export interface ProviderProductMap {
  subscriptions: Record<string, string[]>;
  creditPacks: Record<string, string[]>;
}

export interface PaymentConfig {
  creditPacks: CreditPackDefinition[];
  subscriptions: Record<string, SubscriptionDefinition>;
  providers: Record<PaymentProvider, ProviderProductMap>;
}
