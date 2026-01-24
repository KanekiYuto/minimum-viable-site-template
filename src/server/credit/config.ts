import { buildSubscriptionPlanType, type SubscriptionBillingCycle } from "@/shared/payment/subscription-key";

export type { UserType } from "@/shared/user/types";

// 积分配置
export const creditConfig = {
  // 每日免费积分数量
  dailyFreeCredit: {
    default: 10,
  },

  // 积分类型
  creditTypes: {
    dailyFree: "daily_free",
    quotaPack: "quota_pack",
  },

  // 用户类型
  userTypes: {
    free: "free",
    basic: "basic",
    plus: "plus",
    pro: "pro",
  },
} as const;



/**
 * 构造订阅积分类型（与 subscriptionPlanType 同格式）
 */
export function buildSubscriptionCreditType(
  billingCycle: SubscriptionBillingCycle,
  planId: string,
): string {
  return buildSubscriptionPlanType(billingCycle, planId);
}

/**
 * 获取每日免费积分数量
 */
export function getDailyFreeCredit(): number {
  return creditConfig.dailyFreeCredit.default;
}
