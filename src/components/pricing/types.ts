/**
 * 定价方案接口
 */
export interface PricingPlan {
  /** 方案ID */
  id: string;
  /** 方案名称 */
  name: string;
  /** 方案描述（可选） */
  description?: string;
  /** 月度价格（美元） */
  monthlyPrice: number;
  /** 年度价格（美元） */
  yearlyPrice?: number;
  /** 功能列表 */
  features: PricingFeature[];
  /** 是否推荐 */
  isPopular?: boolean;
  /** 是否特别优惠 */
  isSpecialOffer?: boolean;
  /** CTA按钮文本 */
  ctaText: string;
  /** 是否为免费方案 */
  isFree?: boolean;
  /** 卡片背景颜色类 */
  colorClass: string;
  /** 外容器纯色背景（用于推荐卡片） */
  outerColor?: string;
  /** Creem Pay 产品 ID */
  creemPayProductId?: string;
}

/**
 * 定价功能接口
 */
export interface PricingFeature {
  /** 功能文本 */
  text: string;
  /** 是否无限制 */
  isUnlimited?: boolean;
  /** 是否不支持该功能 */
  isNotSupported?: boolean;
  /** 是否有提示信息 */
  hasTooltip?: boolean;
  /** 提示信息内容 */
  tooltipText?: string;
}

/**
 * 计费周期类型
 */
export type BillingCycle = "monthly" | "yearly" | "onetime";

/**
 * 计费周期配置
 */
export interface BillingCycleConfig {
  /** 周期ID */
  id: BillingCycle;
  /** 显示文本 */
  label: string;
  /** 节省百分比 */
  savePercent?: number;
}
