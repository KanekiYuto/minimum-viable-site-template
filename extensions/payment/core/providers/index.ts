import type { PaymentProvider } from "../types";
import { creemProvider } from './creem';
import type { PaymentProviderAdapter } from './types';

/**
 * 支付 provider 注册表。
 *
 * 该层只负责“根据 provider 名称拿到实现”，不存放任何产品配置。
 */
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
