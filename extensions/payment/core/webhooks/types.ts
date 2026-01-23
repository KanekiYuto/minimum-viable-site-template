import type { NextRequest } from 'next/server';

export interface PaymentWebhookAdapter {
  handle(request: NextRequest): Promise<Response>;
}
