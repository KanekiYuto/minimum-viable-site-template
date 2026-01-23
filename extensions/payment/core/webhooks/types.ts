import type { NextRequest } from 'next/server';

/**
 * Webhook 适配器接口（每个 provider 各自实现）。
 *
 * 约定：实现内部自行做签名校验、解析事件并分发到业务处理函数。
 */
export interface PaymentWebhookAdapter {
  handle(request: NextRequest): Promise<Response>;
}
