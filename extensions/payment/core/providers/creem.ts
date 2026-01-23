import type { CreateCheckoutParams, PaymentProviderAdapter } from './types';
import { getCreemClient } from '../creem-client';

/**
 * Creem provider 适配器。
 *
 * 将通用的 `CreateCheckoutParams` 转换为 `creem_io` SDK 调用。
 */
export const creemProvider: PaymentProviderAdapter = {
  async createCheckout(params: CreateCheckoutParams) {
    const creem = getCreemClient();
    const checkout = await creem.checkouts.create({
      productId: params.productId,
      successUrl: params.successUrl,
      metadata: params.metadata,
      customer: params.customer?.email ? { email: params.customer.email } : undefined,
      units: params.units,
    });

    if (!checkout.checkoutUrl) {
      throw new Error('Checkout URL is missing');
    }

    return { checkoutUrl: checkout.checkoutUrl };
  },
};
