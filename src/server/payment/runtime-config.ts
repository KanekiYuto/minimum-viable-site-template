import type {
  CreemRuntimeConfig,
  PaymentRuntimeConfig,
} from "@extensions/payment/core/runtime-config";

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

export function getCreemRuntimeConfigFromEnv(options?: {
  requireWebhookSecret?: boolean;
}): CreemRuntimeConfig {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (options?.requireWebhookSecret && !webhookSecret) {
    throw new Error("Missing env: CREEM_WEBHOOK_SECRET");
  }

  return {
    apiKey: requireEnv("CREEM_API_KEY"),
    testMode: process.env.NODE_ENV !== "production",
    webhookSecret: webhookSecret || undefined,
  };
}

export function getPaymentRuntimeConfigFromEnv(): PaymentRuntimeConfig {
  return {
    creem: getCreemRuntimeConfigFromEnv(),
  };
}
