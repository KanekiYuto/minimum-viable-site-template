type CheckoutRequest = {
  productId: string;
  metadata: Record<string, string | number | null>;
  customer: { email: string; name?: string };
  type: 'sub' | 'one-time';
  successUrl?: string;
};

type CheckoutResponse = {
  checkoutUrl?: string;
};

export const createPaymentCheckout = async (
  payload: CheckoutRequest,
): Promise<CheckoutResponse> => {
  const successUrl = `${window.location.origin}/api/adapter/creem/${payload.type}`;
    
  const response = await fetch('/api/payment/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      successUrl,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }

  return (await response.json()) as CheckoutResponse;
};
