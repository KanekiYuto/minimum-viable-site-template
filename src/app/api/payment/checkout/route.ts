import { NextRequest } from "next/server";
import { DEFAULT_PAYMENT_PROVIDER } from "@/shared/payment/provider";
import { getPaymentRuntimeConfigFromEnv } from "@/server/payment/runtime-config";
import { resolveCreemProductId, type CheckoutType } from "@/server/payment/providers/creem/mapping";
import { getPaymentProvider } from "@extensions/payment/core/providers";

type CheckoutRequest = {
  type: CheckoutType;
  sku: string;
  metadata: Record<string, string | number | null>;
  customer?: { email?: string; name?: string };
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutRequest;

  if (!body.type) {
    return Response.json({ error: "Missing type" }, { status: 400 });
  }

  if (!body.sku) {
    return Response.json({ error: "Missing sku" }, { status: 400 });
  }

  const customerEmail = body.customer?.email;
  if (!customerEmail) {
    return Response.json({ error: "Missing customer.email" }, { status: 400 });
  }

  const provider = DEFAULT_PAYMENT_PROVIDER;
  const productId = resolveCreemProductId(body.type, body.sku);
  const successUrl = new URL(`/api/adapter/payment/${body.type}`, request.nextUrl.origin);
  successUrl.searchParams.set("sku", body.sku);

  try {
    const adapter = getPaymentProvider(provider, getPaymentRuntimeConfigFromEnv());
    const { checkoutUrl } = await adapter.createCheckout({
      productId,
      successUrl: successUrl.toString(),
      metadata: body.metadata,
      customer: { email: customerEmail },
      units: 1,
    });

    return Response.json({ checkoutUrl, sku: body.sku });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
