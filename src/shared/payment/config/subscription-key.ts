export type SubscriptionBillingCycle = 'monthly' | 'yearly';

/**
 * 生成订阅 planType key（用于配置索引、产品映射、webhook 反查等）。
 *
 * 约定格式：`${billingCycle}_${planId}`，例如：
 * - `monthly_basic`
 * - `yearly_pro`
 */
export function buildSubscriptionPlanType(
  billingCycle: SubscriptionBillingCycle,
  planId: string,
): string {
  return `${billingCycle}_${planId}`;
}

/**
 * 解析订阅 planType key。
 *
 * - 如果符合 `${billingCycle}_${planId}` 结构，返回解析结果
 * - 否则认为是“纯 planId”（cycle 为 null），便于更灵活的兼容
 */
export function parseSubscriptionPlanType(value: string): {
  billingCycle: SubscriptionBillingCycle | null;
  planId: string;
} {
  const [maybeCycle, ...rest] = value.split('_');
  if (maybeCycle === 'monthly' || maybeCycle === 'yearly') {
    return { billingCycle: maybeCycle, planId: rest.join('_') };
  }
  return { billingCycle: null, planId: value };
}

/**
 * 从 subscriptionPlanType 中取 planId（兜底返回 free）
 */
export function getPlanIdFromSubscriptionPlanType(value: string): string {
  const parsed = parseSubscriptionPlanType(value);
  return parsed.planId || 'free';
}

