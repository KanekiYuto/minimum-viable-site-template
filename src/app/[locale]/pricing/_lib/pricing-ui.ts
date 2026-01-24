import { PLAN_IDS } from "@/shared/payment/catalog/catalog";

/**
 * Pricing 页 UI 元信息（仅展示相关：颜色、徽章、排序、禁用项）。
 *
 * 说明：
 * - 这部分刻意放在 app 层（`pricing/_lib`），避免进入 shared/domain 后造成“业务配置 vs UI 配置”混杂。
 * - `PLAN_IDS` 来自 catalog（业务定义），这里对其做 UI 顺序/样式的补充。
 */
type PlanDisplayEntry = {
  pricingCard: { colorClass: string; outerColor?: string };
  isPopular?: boolean;
  isSpecialOffer?: boolean;
};

const PLAN_DISPLAY: Record<string, PlanDisplayEntry> = {
  free: {
    pricingCard: {
      colorClass:
        "bg-[linear-gradient(180deg,rgba(96,125,139,0.03)_0%,rgba(96,125,139,0.30)_100%)]",
    },
  },
  basic: {
    pricingCard: {
      colorClass:
        "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(58,134,255,0.30)_100%)]",
      outerColor: "bg-[#3A86FF]",
    },
    isPopular: true,
  },
  plus: {
    pricingCard: {
      colorClass:
        "bg-[linear-gradient(180deg,rgba(251,86,7,0.03)_0%,rgba(251,86,7,0.30)_100%)]",
    },
  },
  pro: {
    pricingCard: {
      colorClass:
        "bg-[linear-gradient(180deg,rgba(255,0,110,0.03)_0%,rgba(255,0,110,0.30)_100%)]",
      outerColor: "bg-[#E91E63]",
    },
    isSpecialOffer: true,
  },
};

export const PRICING_PLAN_ORDER: readonly string[] = ["free", ...PLAN_IDS];

/**
 * 点数包卡片外框渐变色（按 pack.name 映射）。
 */
export const CREDIT_PACK_ACCENT_COLORS_BY_NAME: Record<string, string> = {
  mini: "bg-[#9CA3AF]",
  standard: "bg-[#3A86FF]",
  pro: "bg-[#FB5607]",
  max: "bg-[#E91E63]",
};

/**
 * 某些套餐在 features 列表中需要显示 “Not supported” 的条目索引。
 */
export const PLAN_DISABLED_FEATURE_INDEXES: Record<string, number[]> = {
  free: [6],
};

/**
 * 获取套餐禁用的 feature 索引（找不到则返回空数组）。
 */
export function getPlanDisabledFeatureIndexes(planId: string): number[] {
  return PLAN_DISABLED_FEATURE_INDEXES[planId] || [];
}

/**
 * 获取套餐卡片的 UI 展示配置（颜色/徽章）。
 */
export function getPricingCardDisplay(planId: string): PlanDisplayEntry {
  return PLAN_DISPLAY[planId] ?? PLAN_DISPLAY.free;
}
