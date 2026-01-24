import type { NextRequest } from 'next/server';
import { getPaymentWebhookAdapter } from '@extensions/payment/core/webhooks';
import { getCreemRuntimeConfigFromEnv } from '@/server/payment/runtime-config';
import { createCreemWebhookHandlers } from '@/server/payment/creem-webhook-handlers';

/**
 * Creem 支付 Webhook 处理器
 *
 * 用于接收和处理 Creem 支付平台的 webhook 事件
 * Webhook URL: /api/creem/webhook
 *
 * 注意事项:
 * 1. 所有回调函数应该是幂等的(可以安全地多次调用)
 * 2. Webhook 可能会重试,因此相同事件可能被触发多次
 * 3. 使用 referenceId 关联用户ID,在 CreemCheckout 组件中传递
 */
export async function POST(request: NextRequest) {
  return getPaymentWebhookAdapter('creem', {
    creem: getCreemRuntimeConfigFromEnv({ requireWebhookSecret: true }),
  }, {
    creem: createCreemWebhookHandlers(),
  }).handle(request);
}
