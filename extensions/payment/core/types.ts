/**
 * 支持的支付提供商枚举。
 *
 * 应用层（例如从 env/config）选择支付提供商，然后通过 `extensions/payment/core/*`
 * 的提供商/webhook 注册表解析到具体实现。
 */
export type { PaymentProvider } from "../shared/types";
