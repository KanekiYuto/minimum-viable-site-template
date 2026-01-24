import { db } from "@/server/db";
import { transaction } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * 根据支付平台交易 ID 获取交易记录
 */
export async function findTransactionByPaymentTransactionId(paymentTransactionId: string) {
  const [existing] = await db
    .select()
    .from(transaction)
    .where(eq(transaction.paymentTransactionId, paymentTransactionId))
    .limit(1);

  return existing ?? null;
}

/**
 * 创建一次性支付交易
 */
export async function createOneTimePaymentTransaction(payload: {
  userId: string;
  paymentTransactionId: string;
  productId: string;
  amount: number;
  currency: string;
}) {
  const [record] = await db
    .insert(transaction)
    .values({
      userId: payload.userId,
      paymentPlatform: "creem",
      paymentTransactionId: payload.paymentTransactionId,
      productId: payload.productId,
      type: "one_time_payment",
      amount: payload.amount,
      currency: payload.currency,
    })
    .returning();

  return record ?? null;
}

/**
 * 创建订阅支付交易
 */
export async function createSubscriptionPaymentTransaction(payload: {
  userId: string;
  subscriptionId: string;
  paymentTransactionId: string;
  productId: string;
  amount: number;
  currency: string;
}) {
  const [record] = await db
    .insert(transaction)
    .values({
      userId: payload.userId,
      subscriptionId: payload.subscriptionId,
      paymentPlatform: "creem",
      paymentTransactionId: payload.paymentTransactionId,
      productId: payload.productId,
      type: "subscription_payment",
      amount: payload.amount,
      currency: payload.currency,
    })
    .returning();

  return record ?? null;
}

