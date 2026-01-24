/**
 * 支付配置源（单一真相 / 最容易扩展的入口）。
 *
 * 目标：新增一个套餐时，只需要：
 * 1) 在 `SUBSCRIPTION_PLAN_SOURCES` 里加一项（monthly/yearly 两个变体）
 * 2) 在 `PLAN_DISPLAY` 里补充 UI 元信息（颜色、徽章等）
 * 3) 在 `messages/<locale>/pricing.json` 增加 `plans.<planId>.*` 文案（name/ctaText/features 数组）
 * 4) 运行 `pnpm creem:sync-products` 生成对应的产品 ID（写入 `config/products/creem/*`）
 *
 * 注意：这里是“配置/数据”，运行时逻辑在 `extensions/payment/core`。
 */

type ProductIds = { historical: string[] };
type BillingCycle = 'monthly' | 'yearly';

import { buildSubscriptionPlanType } from './subscription-key';

export type SubscriptionPlanSource = {
  id: string; // planId（如 basic / plus / pro / enterprise）
  monthly: {
    price: number;
    credits: number;
    periodMonths: 1;
    concurrency: { image: number; video: number };
    ids: ProductIds;
  };
  yearly: {
    price: number;
    credits: number;
    periodMonths: 12;
    concurrency: { image: number; video: number };
    ids: ProductIds;
  };
};

export type CreditPackSource = {
  id: string;
  name: string;
  price: number;
  bonusRate: number;
  credits: number;
  validDays: number;
  ids: ProductIds;
};

/**
 * 套餐 UI 元信息（用于定价卡片/设置页展示）。
 *
 * - `pricingCard.colorClass/outerColor`：用于定价页卡片背景
 * - `badgeStyle`：用于设置页 Badge 的色彩
 * - `isPopular/isSpecialOffer`：用于定价卡片顶部徽章
 */
export const PLAN_DISPLAY = {
  free: {
    pricingCard: {
      colorClass:
        'bg-[linear-gradient(180deg,rgba(96,125,139,0.03)_0%,rgba(96,125,139,0.30)_100%)]',
    },
    badgeStyle: { colorClass: 'text-gray-600', bgClass: 'bg-gray-100' },
  },
  basic: {
    pricingCard: {
      colorClass:
        'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(58,134,255,0.30)_100%)]',
      outerColor: 'bg-[#3A86FF]',
    },
    isPopular: true,
    badgeStyle: { colorClass: 'text-green-600', bgClass: 'bg-green-50' },
  },
  plus: {
    pricingCard: {
      colorClass:
        'bg-[linear-gradient(180deg,rgba(251,86,7,0.03)_0%,rgba(251,86,7,0.30)_100%)]',
    },
    badgeStyle: { colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
  },
  pro: {
    pricingCard: {
      colorClass:
        'bg-[linear-gradient(180deg,rgba(255,0,110,0.03)_0%,rgba(255,0,110,0.30)_100%)]',
      outerColor: 'bg-[#E91E63]',
    },
    isSpecialOffer: true,
    badgeStyle: { colorClass: 'text-pink-600', bgClass: 'bg-pink-50' },
  },
} as const satisfies Record<
  string,
  {
    pricingCard: { colorClass: string; outerColor?: string };
    badgeStyle: { colorClass: string; bgClass: string };
    isPopular?: boolean;
    isSpecialOffer?: boolean;
  }
>;

/**
 * 定价页 features 中需要置灰/标记为“不支持”的条目（按 index）
 */
export const PLAN_DISABLED_FEATURE_INDEXES: Record<string, number[]> = {
  free: [6], // "Video generation"
};

/**
 * Creem 点数包卡片渐变外框色（由 pack.name 匹配）
 */
export const CREDIT_PACK_ACCENT_COLORS_BY_NAME: Record<string, string> = {
  mini: 'bg-[#9CA3AF]',
  standard: 'bg-[#3A86FF]',
  pro: 'bg-[#FB5607]',
  max: 'bg-[#E91E63]',
};

/**
 * 订阅套餐配置（新增套餐主要改这里）
 */
export const SUBSCRIPTION_PLAN_SOURCES: SubscriptionPlanSource[] = [
  {
    id: 'basic',
    monthly: {
      price: 10,
      credits: 1500,
      periodMonths: 1,
      concurrency: { image: 8, video: 2 },
      ids: { historical: [] as string[] },
    },
    yearly: {
      price: 96,
      credits: 21600,
      periodMonths: 12,
      concurrency: { image: 8, video: 2 },
      ids: { historical: [] as string[] },
    },
  },
  {
    id: 'plus',
    monthly: {
      price: 20,
      credits: 4500,
      periodMonths: 1,
      concurrency: { image: 12, video: 4 },
      ids: { historical: [] as string[] },
    },
    yearly: {
      price: 192,
      credits: 64800,
      periodMonths: 12,
      concurrency: { image: 12, video: 4 },
      ids: { historical: [] as string[] },
    },
  },
  {
    id: 'pro',
    monthly: {
      price: 100,
      credits: 20000,
      periodMonths: 1,
      concurrency: { image: 60, video: 20 },
      ids: { historical: [] as string[] },
    },
    yearly: {
      price: 960,
      credits: 288000,
      periodMonths: 12,
      concurrency: { image: 60, video: 20 },
      ids: { historical: [] as string[] },
    },
  },
];

/**
 * 套餐展示顺序（free 固定在最前，其余按 `SUBSCRIPTION_PLAN_SOURCES` 的顺序）
 */
export const PLAN_ORDER: readonly string[] = [
  'free',
  ...SUBSCRIPTION_PLAN_SOURCES.map((plan) => plan.id),
];

/**
 * 点数包配置（一次性购买）
 */
export const CREDIT_PACK_SOURCES: CreditPackSource[] = [
  {
    id: 'mini_30d',
    name: 'mini',
    price: 10,
    bonusRate: 0,
    credits: 800,
    validDays: 30,
    ids: { historical: [] as string[] },
  },
  {
    id: 'standard_30d',
    name: 'standard',
    price: 50,
    bonusRate: 0.15,
    credits: 4600,
    validDays: 30,
    ids: { historical: [] as string[] },
  },
  {
    id: 'pro_30d',
    name: 'pro',
    price: 200,
    bonusRate: 0.3,
    credits: 20800,
    validDays: 30,
    ids: { historical: [] as string[] },
  },
  {
    id: 'max_30d',
    name: 'max',
    price: 1000,
    bonusRate: 0.45,
    credits: 116000,
    validDays: 30,
    ids: { historical: [] as string[] },
  },
  {
    id: 'mini_365d',
    name: 'mini',
    price: 12,
    bonusRate: 0,
    credits: 800,
    validDays: 365,
    ids: { historical: [] as string[] },
  },
  {
    id: 'standard_365d',
    name: 'standard',
    price: 60,
    bonusRate: 0.15,
    credits: 4600,
    validDays: 365,
    ids: { historical: [] as string[] },
  },
  {
    id: 'pro_365d',
    name: 'pro',
    price: 240,
    bonusRate: 0.3,
    credits: 20800,
    validDays: 365,
    ids: { historical: [] as string[] },
  },
  {
    id: 'max_365d',
    name: 'max',
    price: 1200,
    bonusRate: 0.45,
    credits: 116000,
    validDays: 365,
    ids: { historical: [] as string[] },
  },
];

const buildSubscriptionRecord = () => {
  const entries: Array<
    [
      string,
      {
        planType: string;
        billingCycle: BillingCycle;
        price: number;
        credits: number;
        periodMonths: number;
        concurrency: { image: number; video: number };
        ids: ProductIds;
      },
    ]
  > = [];

  SUBSCRIPTION_PLAN_SOURCES.forEach((plan) => {
    entries.push([
      buildSubscriptionPlanType('monthly', plan.id),
      {
        planType: plan.id,
        billingCycle: 'monthly',
        price: plan.monthly.price,
        credits: plan.monthly.credits,
        periodMonths: plan.monthly.periodMonths,
        concurrency: plan.monthly.concurrency,
        ids: plan.monthly.ids,
      },
    ]);
    entries.push([
      buildSubscriptionPlanType('yearly', plan.id),
      {
        planType: plan.id,
        billingCycle: 'yearly',
        price: plan.yearly.price,
        credits: plan.yearly.credits,
        periodMonths: plan.yearly.periodMonths,
        concurrency: plan.yearly.concurrency,
        ids: plan.yearly.ids,
      },
    ]);
  });

  return Object.fromEntries(entries);
};

/**
 * 保持对外结构不变（供 index.ts 与 creem-sync-products.ts 使用）
 */
export const paymentConfigSource = {
  creditPacks: CREDIT_PACK_SOURCES,
  subscriptions: buildSubscriptionRecord(),
} as const;
