/**
 * 套餐类型
 */
export type PlanType = "free" | "basic" | "plus" | "pro";

/**
 * 将订阅计划类型映射到套餐类型
 * @param subscriptionPlanType 订阅计划类型（如 monthly_basic, yearly_pro 等）
 * @returns 套餐类型
 */
export function mapSubscriptionPlanType(
  subscriptionPlanType: string
): PlanType {
  if (subscriptionPlanType.includes("pro")) {
    return "pro";
  }
  if (subscriptionPlanType.includes("plus")) {
    return "plus";
  }
  if (subscriptionPlanType.includes("basic")) {
    return "basic";
  }
  return "free";
}

/**
 * 套餐信息
 */
export interface PlanInfo {
  name: string;
  colorClass: string;
  bgClass: string;
}

/**
 * 套餐样式配置
 */
const PLAN_STYLES: Record<PlanType, { colorClass: string; bgClass: string }> = {
  free: {
    colorClass: "text-gray-600",
    bgClass: "bg-gray-100",
  },
  basic: {
    colorClass: "text-green-600",
    bgClass: "bg-green-50",
  },
  plus: {
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
  },
  pro: {
    colorClass: "text-pink-600",
    bgClass: "bg-pink-50",
  },
};

/**
 * 获取套餐信息
 * @param type 套餐类型
 * @param translateFn 翻译函数
 * @returns 套餐信息（名称和样式）
 */
export function getPlanInfo(
  type: string,
  translateFn: (key: string) => string
): PlanInfo {
  const planType = (type as PlanType) || "free";
  const styles = PLAN_STYLES[planType] || PLAN_STYLES.free;

  return {
    name: translateFn(planType),
    ...styles,
  };
}

/**
 * 获取套餐样式
 * @param type 套餐类型
 * @returns 套餐样式（颜色类和背景类）
 */
export function getPlanStyles(type: string): {
  colorClass: string;
  bgClass: string;
} {
  const planType = (type as PlanType) || "free";
  return PLAN_STYLES[planType] || PLAN_STYLES.free;
}
