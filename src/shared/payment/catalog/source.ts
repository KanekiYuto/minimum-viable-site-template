/**
 * 商品目录（单一真相 / 可编辑）。
 *
 * 这里的内容是“业务商品定义”，不包含任何支付平台的 `productId`：
 * - 订阅：planId + monthly/yearly 两个变体（价格、点数、并发等）
 * - 点数包：packId（即 SKU）+ 价格/点数/有效期
 *
 * 支付平台映射在服务端维护（例如 `src/server/payment/providers/creem/**`）。
 */

export type SubscriptionPlanSource = {
  /** planId，例如 basic / plus / pro */
  id: string;
  monthly: {
    price: number;
    credits: number;
    periodMonths: 1;
    concurrency: { image: number; video: number };
  };
  yearly: {
    price: number;
    credits: number;
    periodMonths: 12;
    concurrency: { image: number; video: number };
  };
};

export type CreditPackSource = {
  /** packId，同时也是点数包 SKU，例如 `mini_30d` */
  id: string;
  /** 展示名（用于 UI），例如 mini/standard */
  name: string;
  price: number;
  bonusRate: number;
  credits: number;
  validDays: number;
};

/**
 * 订阅套餐定义（新增套餐主要改这里）。
 */
export const SUBSCRIPTION_PLAN_SOURCES: SubscriptionPlanSource[] = [
  {
    id: "basic",
    monthly: {
      price: 10,
      credits: 1500,
      periodMonths: 1,
      concurrency: { image: 8, video: 2 },
    },
    yearly: {
      price: 96,
      credits: 21600,
      periodMonths: 12,
      concurrency: { image: 8, video: 2 },
    },
  },
  {
    id: "plus",
    monthly: {
      price: 20,
      credits: 4500,
      periodMonths: 1,
      concurrency: { image: 12, video: 4 },
    },
    yearly: {
      price: 192,
      credits: 64800,
      periodMonths: 12,
      concurrency: { image: 12, video: 4 },
    },
  },
  {
    id: "pro",
    monthly: {
      price: 100,
      credits: 20000,
      periodMonths: 1,
      concurrency: { image: 60, video: 20 },
    },
    yearly: {
      price: 960,
      credits: 288000,
      periodMonths: 12,
      concurrency: { image: 60, video: 20 },
    },
  },
];

/**
 * 点数包定义（一次性购买）。
 */
export const CREDIT_PACK_SOURCES: CreditPackSource[] = [
  {
    id: "mini_30d",
    name: "mini",
    price: 10,
    bonusRate: 0,
    credits: 800,
    validDays: 30,
  },
  {
    id: "standard_30d",
    name: "standard",
    price: 50,
    bonusRate: 0.15,
    credits: 4600,
    validDays: 30,
  },
  {
    id: "pro_30d",
    name: "pro",
    price: 200,
    bonusRate: 0.3,
    credits: 20800,
    validDays: 30,
  },
  {
    id: "max_30d",
    name: "max",
    price: 1000,
    bonusRate: 0.45,
    credits: 116000,
    validDays: 30,
  },
  {
    id: "mini_365d",
    name: "mini",
    price: 12,
    bonusRate: 0,
    credits: 800,
    validDays: 365,
  },
  {
    id: "standard_365d",
    name: "standard",
    price: 60,
    bonusRate: 0.15,
    credits: 4600,
    validDays: 365,
  },
  {
    id: "pro_365d",
    name: "pro",
    price: 240,
    bonusRate: 0.3,
    credits: 20800,
    validDays: 365,
  },
  {
    id: "max_365d",
    name: "max",
    price: 1200,
    bonusRate: 0.45,
    credits: 116000,
    validDays: 365,
  },
];

