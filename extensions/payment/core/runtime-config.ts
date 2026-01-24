export type CreemRuntimeConfig = {
  apiKey: string;
  testMode: boolean;
  webhookSecret?: string;
};

export type PaymentRuntimeConfig = {
  creem?: CreemRuntimeConfig;
};

