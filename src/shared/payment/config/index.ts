import type { PaymentConfig, PaymentProvider, ProviderProductMap } from './payment.types';
import { paymentConfigSource } from './payment-config.source';
import { creemProducts } from './products/creem/creem';

// 运行时支付配置入口：合并「基础配置」与「当前产品 ID」
const appendCurrentId = (historical: string[], current?: string) =>
  !current || historical.includes(current) ? historical : [...historical, current];

// 基于历史 ID + 当前 ID 生成支付平台的可用产品 ID 列表
const buildProviders = (source: typeof paymentConfigSource): PaymentConfig['providers'] => {
  const subscriptions = Object.fromEntries(
    Object.entries(source.subscriptions).map(([key, value]) => [
      key,
      appendCurrentId(
        value.ids?.historical || [],
        creemProducts.subscriptions[key as keyof typeof creemProducts.subscriptions]?.ids?.current
      ),
    ])
  );
  const creditPacks = Object.fromEntries(
    source.creditPacks.map((pack) => [
      pack.id,
      appendCurrentId(
        pack.ids?.historical || [],
        creemProducts.creditPacks.find((item) => item.id === pack.id)?.ids?.current
      ),
    ])
  );
  return {
    creem: { subscriptions, creditPacks },
    stripe: { subscriptions: {}, creditPacks: {} },
    paypal: { subscriptions: {}, creditPacks: {} },
  };
};

// 剔除 ids，仅保留价格/积分等基础信息
const stripIds = (source: typeof paymentConfigSource) => ({
  creditPacks: source.creditPacks.map(({ ids, ...rest }) => rest),
  subscriptions: Object.fromEntries(
    Object.entries(source.subscriptions).map(([key, value]) => {
      const { ids, ...rest } = value;
      return [key, rest];
    })
  ),
});

const providers = buildProviders(paymentConfigSource);
const { creditPacks, subscriptions } = stripIds(paymentConfigSource);

export const PAYMENT_CONFIG: PaymentConfig = { creditPacks, subscriptions, providers };

// 默认支付平台（硬编码）
export const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = 'creem';

export function getProviderConfig(provider: PaymentProvider = DEFAULT_PAYMENT_PROVIDER): ProviderProductMap {
  return PAYMENT_CONFIG.providers[provider];
}
