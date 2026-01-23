import type { PaymentProvider } from "../types";
import { creemWebhookAdapter } from './creem';
import type { PaymentWebhookAdapter } from './types';

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
