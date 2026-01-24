/**
 * 支付插件共享类型。
 *
 * 这些类型保持“与宿主应用无关”，因此可以同时被以下位置安全复用：
 * - `extensions/payment/core/**`
 * - 宿主应用通过 `@extensions/*` 路径别名引用的代码
 */
export type PaymentProvider = "creem" | "stripe" | "paypal";
