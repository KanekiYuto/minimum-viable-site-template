import type { PaymentProvider } from "../types";
import { creemWebhookAdapter } from './creem';
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

const WEBHOOK_PROVIDERS: Record<PaymentProvider, PaymentWebhookAdapter> = {
  creem: creemWebhookAdapter,
  stripe: unsupportedWebhookProvider('stripe'),
  paypal: unsupportedWebhookProvider('paypal'),
};

export const getPaymentWebhookAdapter = (
  provider: PaymentProvider,
) => WEBHOOK_PROVIDERS[provider];
