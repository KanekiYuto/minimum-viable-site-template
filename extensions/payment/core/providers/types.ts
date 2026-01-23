/**
 * 可选的客户信息（会透传给支付提供商）。
 *
 * 各 provider SDK 可能支持更多字段；这里保持最小、通用。
 */
export interface CheckoutCustomer {
  email?: string;
  name?: string;
}

/**
 * provider adapter 统一使用的 checkout 创建参数。
 *
 * 该层必须保持 provider-agnostic，并且不包含 app 配置/数据。
 */
export interface CreateCheckoutParams {
  productId: string;
  successUrl: string;
  metadata?: Record<string, string | number | null>;
  customer?: CheckoutCustomer;
  units?: number;
}

/**
 * 支付提供商适配器接口（每个 provider 各自实现）。
 */
export interface PaymentProviderAdapter {
  createCheckout(params: CreateCheckoutParams): Promise<{ checkoutUrl: string }>;
}
