import { createCreem } from 'creem_io';
import type { CreemRuntimeConfig } from './runtime-config';

type CreemClientOptions = {
  requireWebhookSecret?: boolean;
};

/**
 * 服务端：Creem SDK 工厂。
 *
 * 说明：`extensions/payment` 本身不读取环境变量，凭证由 app 层注入。
 */
export const getCreemClient = (
  config: CreemRuntimeConfig,
  { requireWebhookSecret }: CreemClientOptions = {},
) => {
  if (!config.apiKey) {
    throw new Error('Missing Creem apiKey');
  }

  if (requireWebhookSecret && !config.webhookSecret) {
    throw new Error('Missing Creem webhookSecret');
  }

  return createCreem({
    apiKey: config.apiKey,
    testMode: config.testMode,
    webhookSecret: config.webhookSecret,
  });
};
