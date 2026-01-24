import type { PlanType } from "@/shared/payment/types";

export type PlanUiStyle = { colorClass: string; bgClass: string };

const PLAN_BADGE_STYLES: Record<string, PlanUiStyle> = {
  free: { colorClass: "text-gray-600", bgClass: "bg-gray-100" },
  basic: { colorClass: "text-green-600", bgClass: "bg-green-50" },
  plus: { colorClass: "text-blue-600", bgClass: "bg-blue-50" },
  pro: { colorClass: "text-pink-600", bgClass: "bg-pink-50" },
};

export function getPlanUiStyle(type?: string | null): PlanUiStyle {
  const key = (type as PlanType) || "free";
  return PLAN_BADGE_STYLES[key] ?? PLAN_BADGE_STYLES.free;
}

