import { db } from "@/server/db";
import { subscription } from "@/server/db/schema";
import { and, desc, eq } from "drizzle-orm";

/**
 * 获取当前激活订阅（保持与原逻辑一致：按 createdAt 升序取 1 条）
 */
export async function getCurrentActiveSubscriptionByUserId(userId: string) {
  const [currentSubscription] = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.status, "active")))
    .orderBy(subscription.createdAt)
    .limit(1);

  return currentSubscription ?? null;
}

/**
 * 获取用户全部订阅（按创建时间倒序）
 */
export async function listSubscriptionsByUserId(userId: string) {
  return db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt));
}

/**
 * 判断某 customerId 是否属于该用户
 */
export async function findOwnedSubscriptionByUserAndCustomerId(
  userId: string,
  customerId: string,
) {
  const [record] = await db
    .select({ id: subscription.id })
    .from(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.paymentCustomerId, customerId)))
    .limit(1);

  return record ?? null;
}

/**
 * 根据支付平台订阅 ID 获取订阅记录
 */
export async function findSubscriptionByPaymentId(paymentSubscriptionId: string) {
  const [record] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.paymentSubscriptionId, paymentSubscriptionId))
    .limit(1);

  return record ?? null;
}

/**
 * 获取用户当前激活订阅
 */
export async function findActiveSubscriptionByUserId(userId: string) {
  const [active] = await db
    .select()
    .from(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.status, "active")))
    .limit(1);

  return active ?? null;
}

/**
 * 按支付平台订阅 ID 更新订阅
 */
export async function updateSubscriptionByPaymentId(
  paymentSubscriptionId: string,
  payload: Record<string, unknown>,
) {
  return db
    .update(subscription)
    .set(payload)
    .where(eq(subscription.paymentSubscriptionId, paymentSubscriptionId));
}

/**
 * 按订阅 ID 更新订阅
 */
export async function updateSubscriptionById(
  subscriptionId: string,
  payload: Record<string, unknown>,
) {
  return db.update(subscription).set(payload).where(eq(subscription.id, subscriptionId));
}

/**
 * 创建订阅（Creem webhook 落库使用）
 */
export async function createSubscription(payload: {
  userId: string;
  paymentSubscriptionId: string;
  paymentCustomerId: string;
  productId: string;
  planType: string;
  amount: number;
  currency: string;
  expiresAt: Date | null;
  nextBillingAt: Date | null;
}) {
  const [record] = await db
    .insert(subscription)
    .values({
      userId: payload.userId,
      paymentPlatform: "creem",
      paymentSubscriptionId: payload.paymentSubscriptionId,
      paymentCustomerId: payload.paymentCustomerId,
      productId: payload.productId,
      planType: payload.planType,
      status: "active",
      amount: payload.amount,
      currency: payload.currency,
      startedAt: new Date(),
      expiresAt: payload.expiresAt,
      nextBillingAt: payload.nextBillingAt,
    })
    .returning();

  return record ?? null;
}

