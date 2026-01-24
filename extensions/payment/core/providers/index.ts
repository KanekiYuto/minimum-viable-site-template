import type { PaymentProvider } from "../types";
import type { PaymentRuntimeConfig } from '../runtime-config';
import { createCreemProvider } from './creem';
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

export const getPaymentProvider = (
  provider: PaymentProvider,
  runtimeConfig?: PaymentRuntimeConfig,
): PaymentProviderAdapter => {
  if (provider === 'creem') {
    const creemConfig = runtimeConfig?.creem;
    return creemConfig ? createCreemProvider(creemConfig) : unsupportedProvider('creem');
  }

  return unsupportedProvider(provider);
};
