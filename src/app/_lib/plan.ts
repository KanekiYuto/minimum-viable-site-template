import type { PlanType } from "@/shared/payment/types";
import { getPlanIdFromSubscriptionPlanType } from "@/shared/payment/subscription-key";
import { getPlanUiStyle } from "./plan-ui";

/**
 * 将 subscriptionPlanType 映射为 planId
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
 * 套餐信息（用于设置页/Badge 等展示）
 */
export interface PlanInfo {
  name: string;
  colorClass: string;
  bgClass: string;
}

/**
 * 获取套餐信息（名称 + 样式）
 *
 * 注意：国际化由调用方传入 `translateFn` 处理，本文件不直接依赖 i18n。
 */
export function getPlanInfo(type: string, translateFn: (key: string) => string): PlanInfo {
  const planType = (type as PlanType) || "free";
  const styles = getPlanUiStyle(planType);

  return {
    name: translateFn(planType),
    ...styles,
  };
}

export function getPlanStyles(type: string): PlanInfo {
  const planType = (type as PlanType) || "free";
  return { name: planType, ...getPlanUiStyle(planType) };
}

