import type { PaymentProvider } from "../types";
import type { PaymentRuntimeConfig } from '../runtime-config';
import { createCreemWebhookAdapter, type CreemWebhookHandlers } from './creem';
import type { PaymentWebhookAdapter } from './types';

/**
 * Webhook provider 注册表。
 *
 * 用于在统一入口（例如 `/api/webhook/payment/:provider`）里根据 provider 选择正确的处理器。
 */
const unsupportedWebhookProvider = (
  provider: PaymentProvider,
): PaymentWebhookAdapter => ({
  async handle() {
    return Response.json(
      { error: `Payment provider "${provider}" is not configured.` },
      { status: 400 },
    );
  },
});

export type PaymentWebhookHandlers = {
  creem?: CreemWebhookHandlers;
};

export const getPaymentWebhookAdapter = (
  provider: PaymentProvider,
  runtimeConfig?: PaymentRuntimeConfig,
  handlers?: PaymentWebhookHandlers,
): PaymentWebhookAdapter => {
  if (provider === 'creem') {
    const creemConfig = runtimeConfig?.creem;
    const creemHandlers = handlers?.creem;
    return creemConfig && creemHandlers
      ? createCreemWebhookAdapter(creemConfig, creemHandlers)
      : unsupportedWebhookProvider('creem');
  }

  return unsupportedWebhookProvider(provider);
};
