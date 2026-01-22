// 积分配置
export const creditConfig = {
  // 每日免费积分数量
  dailyFreeCredit: {
    default: 10,
  },

  // 积分类型
  creditTypes: {
    dailyFree: "daily_free",
    monthlyBasic: "monthly_basic",
    monthlyPro: "monthly_pro",
    yearlyBasic: "yearly_basic",
    yearlyPro: "yearly_pro",
  },

  // 用户类型
  userTypes: {
    free: "free",
    basic: "basic",
    plus: "plus",
    pro: "pro",
  },
} as const;

export type UserType = "free" | "basic" | "plus" | "pro";

/**
 * 获取每日免费积分数量
 */
export function getDailyFreeCredit(): number {
  return creditConfig.dailyFreeCredit.default;
}
