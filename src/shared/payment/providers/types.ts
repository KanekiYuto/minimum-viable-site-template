export interface CheckoutCustomer {
  email?: string;
  name?: string;
}

export interface CreateCheckoutParams {
  productId: string;
  successUrl: string;
  metadata?: Record<string, string | number | null>;
  customer?: CheckoutCustomer;
  units?: number;
}

export interface PaymentProviderAdapter {
  createCheckout(params: CreateCheckoutParams): Promise<{ checkoutUrl: string }>;
}
