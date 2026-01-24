import { SUBSCRIPTIONS } from "../catalog/catalog";

/**
 * 订阅权益/配额推导（纯函数 + 预计算）。
 *
 * 输出中的 key 命名与 pricing 文案占位符保持一致（例如 `max_images_per_month`）。
 * 如果未来要支持不同模型成本，可以把 IMAGE_COST/VIDEO_COST 抽到更上层配置。
 */
const IMAGE_COST = 5;
const VIDEO_COST = 50;

const SUBSCRIPTION_CREDITS_CONFIG: Record<string, Record<string, number>> =
  buildSubscriptionCreditsConfig();

/**
 * 获取订阅 SKU 对应的周期总点数（四舍五入）。
 */
export function getSubscriptionCreditsAmount(subscriptionSku: string): number {
  return Math.round(SUBSCRIPTIONS[subscriptionSku]?.credits || 0);
}

/**
 * 获取订阅 SKU 的权益配置（用于 UI 文案与服务端配额计算）。
 *
 * 返回值包含：
 * - `credits`：周期总点数
 * - `max_images_per_month` / `max_videos_per_month`：按“每月”折算的上限
 * - `image_concurrent` / `video_concurrent`：并发限制
 */
export function getSubscriptionCreditsConfig(subscriptionSku: string): Record<string, number> {
  return SUBSCRIPTION_CREDITS_CONFIG[subscriptionSku] || {};
}

/**
 * webhook/订单入库时使用的“应发放点数”。
 *
 * 当前策略：订阅支付成功即发放周期总点数（与 `credits` 一致）。
 */
export function getSubscriptionQuota(subscriptionSku: string): number {
  return getSubscriptionCreditsAmount(subscriptionSku);
}

function buildSubscriptionCreditsConfig(): Record<string, Record<string, number>> {
  return Object.fromEntries(
    Object.entries(SUBSCRIPTIONS).map(([subscriptionSku, plan]) => {
      const periodMonths = plan.periodMonths || 1;
      const creditsPerMonth = plan.credits / periodMonths;

      return [
        subscriptionSku,
        {
          credits: getSubscriptionCreditsAmount(subscriptionSku),
          max_images_per_month: Math.floor(creditsPerMonth / IMAGE_COST),
          max_videos_per_month: Math.floor(creditsPerMonth / VIDEO_COST),
          image_concurrent: plan.concurrency.image,
          video_concurrent: plan.concurrency.video,
        },
      ];
    }),
  );
}
