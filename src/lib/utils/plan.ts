import type { PlanType } from "@/shared/payment/config/payment.types";
import { getPlanUiStyle } from "@/shared/payment/config/payment";
import { getPlanIdFromSubscriptionPlanType } from "@/shared/payment/config/subscription-key";

/**
 * 将订阅计划类型映射为套餐类型。
 *
 * 示例：
 * - `monthly_basic` -> `basic`
 * - `yearly_pro` -> `pro`
 */
export function mapSubscriptionPlanType(subscriptionPlanType: string): PlanType {
  const planId = getPlanIdFromSubscriptionPlanType(subscriptionPlanType);
  return planId.length > 0 ? planId : "free";
}

/**
 * 套餐信息（用于设置页/Badge 等展示）。
 */
export interface PlanInfo {
  name: string;
  colorClass: string;
  bgClass: string;
}

/**
 * 获取套餐信息（名称 + 样式）。
 *
 * 注意：国际化由调用方传入 `translateFn` 处理，本文件不直接依赖 i18n。
 */
export function getPlanInfo(
  type: string,
  translateFn: (key: string) => string,
): PlanInfo {
  const planType = (type as PlanType) || "free";
  const styles = getPlanUiStyle(planType);

  return {
    name: translateFn(planType),
    ...styles,
  };
}

/**
 * 获取套餐样式（兜底为 free）。
 */
export function getPlanStyles(type: string): {
  colorClass: string;
  bgClass: string;
} {
  return getPlanUiStyle(type);
}
