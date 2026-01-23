import { NextRequest } from 'next/server';
import { DEFAULT_PAYMENT_PROVIDER } from '@/shared/payment/config';
import { getPaymentProvider } from '@extensions/payment/core/providers';

type CheckoutRequest = {
  productId: string;
  successUrl: string;
  metadata: Record<string, string | number | null>;
  customer?: { email?: string; name?: string };
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutRequest;

  if (!body.productId) {
    return Response.json({ error: 'Missing productId' }, { status: 400 });
  }

  const successUrl = body.successUrl;

  if (!successUrl) {
    return Response.json({ error: 'Missing successUrl' }, { status: 400 });
  }

  const customerEmail = body.customer?.email;
  if (!customerEmail) {
    return Response.json({ error: 'Missing customer.email' }, { status: 400 });
  }

  const provider = DEFAULT_PAYMENT_PROVIDER;

  try {
    const adapter = getPaymentProvider(provider);
    const { checkoutUrl } = await adapter.createCheckout({
      productId: body.productId,
      successUrl,
      metadata: body.metadata,
      customer: { email: customerEmail },
      units: 1,
    });

    return Response.json({ checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
