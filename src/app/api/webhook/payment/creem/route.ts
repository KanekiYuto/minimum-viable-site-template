import type { NextRequest } from 'next/server';
import { getPaymentWebhookAdapter } from '@extensions/payment/core/webhooks';
import { getCreemRuntimeConfigFromEnv } from '@/server/payment/runtime-config';
import { createCreemWebhookHandlers } from '@/server/payment/creem-webhook-handlers';

/**
 * 支付回调（Webhook，Creem）处理器。
 *
 * 用于接收并处理 Creem 支付平台的 webhook 事件。
 * 回调地址（Webhook）：`/api/creem/webhook`
 *
 * 注意事项：
 * 1. 所有回调函数都应该是幂等的（可安全地被重复调用）。
 * 2. Webhook 可能会重试，因此同一事件可能触发多次。
 * 3. 使用 `referenceId` 关联用户 ID（在创建 checkout 时传递）。
 */
export async function POST(request: NextRequest) {
  return getPaymentWebhookAdapter('creem', {
    creem: getCreemRuntimeConfigFromEnv({ requireWebhookSecret: true }),
  }, {
    creem: createCreemWebhookHandlers(),
  }).handle(request);
}
