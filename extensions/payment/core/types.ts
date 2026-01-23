/**
 * 支持的支付提供商枚举。
 *
 * app 层（例如从 env/config）选择 provider，然后通过 `extensions/payment/core/*`
 * 的 provider/webhook registry 解析到具体实现。
 */
export type PaymentProvider = "creem" | "stripe" | "paypal";
