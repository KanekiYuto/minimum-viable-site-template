import { createCreem } from 'creem_io';

type CreemClientOptions = {
  requireWebhookSecret?: boolean;
};

/**
 * 服务端：Creem SDK 工厂。
 *
 * - 从环境变量读取凭证
 * - webhook 场景下可强制要求 `CREEM_WEBHOOK_SECRET` 存在
 */
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
