import type { NextRequest } from 'next/server';
import type { createCreem } from 'creem_io';
import { getCreemClient } from '../creem-client';
import type { CreemRuntimeConfig } from '../runtime-config';
import type { PaymentWebhookAdapter } from './types';

export type CreemWebhookHandlers = Parameters<
  ReturnType<typeof createCreem>['webhooks']['handleEvents']
>[2];

/**
 * Creem webhook 适配器（仅签名校验 + 事件分发）。
 *
 * 注意：该文件不做任何业务落库/配额发放等逻辑，所有处理函数由 app 层注入。
 */
export const createCreemWebhookAdapter = (
  config: CreemRuntimeConfig,
  handlers: CreemWebhookHandlers,
): PaymentWebhookAdapter => ({
  async handle(request: NextRequest) {
    const signature = request.headers.get('creem-signature');
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await request.text();
    const creem = getCreemClient(config, { requireWebhookSecret: true });

    try {
      await creem.webhooks.handleEvents(body, signature, handlers);
      return new Response('OK', { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid signature';
      return new Response(message, { status: 400 });
    }
  },
});

