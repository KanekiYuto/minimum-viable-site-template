import { creemProducts as creemProductsLocal } from "./creem.local";
import { creemProducts as creemProductsProd } from "./creem.prod";

const paymentEnv = process.env.NEXT_PUBLIC_PAYMENT_ENV || process.env.NODE_ENV;
const isProd = paymentEnv === 'production' || paymentEnv === 'prod';

export const creemProducts = isProd ? creemProductsProd : creemProductsLocal;
