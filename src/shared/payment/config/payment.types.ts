/**
 * 支付配置类型定义（仅数据结构）。
 *
 * 注意：运行时支付逻辑（checkout/webhook 等）位于 `extensions/payment/core`。
 */

export type PaymentProvider = 'creem' | 'stripe' | 'paypal';

/**
 * 计费周期类型（订阅）
 */
export type BillingCycle = 'monthly' | 'yearly';

/**
 * 方案类型（用于站内权限/展示）
 */
/**
 * 套餐类型（站内使用）。
 *
 * 数据库字段是 text，因此这里保持开放，便于插件化扩展新增套餐（如 enterprise）。
 * 内置套餐仍建议使用：free/basic/plus/pro。
 */
export type PlanType = string;

export interface CreditPackDefinition {
  id: string;
  name: string;
  price: number;
  bonusRate?: number;
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

/**
 * 定价方案元数据（用于 UI 展示；颜色等）
 */
export interface PricingPlanMetadata {
  id: PlanType;
  monthlyPrice: number;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  outerColor?: string;
  colorClass: string;
}

/**
 * 产品 ID -> 订阅层级的反查结果（用于 webhook/订单处理）
 */
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
