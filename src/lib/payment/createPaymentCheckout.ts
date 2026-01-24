export type CheckoutType = "sub" | "one-time";

export type CreateCheckoutRequest = {
  type: CheckoutType;
  sku: string;
  metadata: Record<string, string | number | null>;
  customer: { email: string; name?: string };
};

export type CreateCheckoutResponse = {
  checkoutUrl?: string;
  sku?: string;
};

export async function createPaymentCheckout(
  payload: CreateCheckoutRequest,
): Promise<CreateCheckoutResponse> {
  const response = await fetch("/api/payment/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Failed to create checkout");
  }

  return (await response.json()) as CreateCheckoutResponse;
}

