import { createCreem } from 'creem_io';

type CreemClientOptions = {
  requireWebhookSecret?: boolean;
};

export const getCreemClient = ({ requireWebhookSecret }: CreemClientOptions = {}) => {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new Error('Missing CREEM_API_KEY');
  }

  if (requireWebhookSecret && !process.env.CREEM_WEBHOOK_SECRET) {
    throw new Error('Missing CREEM_WEBHOOK_SECRET');
  }

  return createCreem({
    apiKey,
    testMode: process.env.NODE_ENV !== 'production',
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
  });
};
