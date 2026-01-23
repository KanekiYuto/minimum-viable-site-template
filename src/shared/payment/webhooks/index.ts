import type { PaymentProvider } from '../config/payment.types';
import { DEFAULT_PAYMENT_PROVIDER } from '../config';
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
  provider: PaymentProvider = DEFAULT_PAYMENT_PROVIDER,
) => WEBHOOK_PROVIDERS[provider];
