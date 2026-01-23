import type { PaymentProvider } from "../types";
import { creemProvider } from './creem';
import type { PaymentProviderAdapter } from './types';

const unsupportedProvider = (provider: PaymentProvider): PaymentProviderAdapter => ({
  async createCheckout() {
    throw new Error(`Payment provider "${provider}" is not configured.`);
  },
});

const PROVIDERS: Record<PaymentProvider, PaymentProviderAdapter> = {
  creem: creemProvider,
  stripe: unsupportedProvider('stripe'),
  paypal: unsupportedProvider('paypal'),
};

export const getPaymentProvider = (
  provider: PaymentProvider,
) => PROVIDERS[provider];
