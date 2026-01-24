/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { credit, subscription, transaction, user } from '@/server/db/schema';
import {
  getCreditPackByProductId,
  getPricingTierByProductId,
  getSubscriptionQuota,
} from '@/shared/payment/config/payment';
import type { CreemWebhookHandlers } from '@extensions/payment/core/webhooks/creem';

/**
 * Creem webhook handlers（服务端落库/发放积分）。
 *
 * 说明：签名校验与事件分发在 `@extensions/payment/core/webhooks/creem`，这里只做项目侧的数据处理。
 */

// 统一解析用户 ID，兼容不同字段命名
const getUserIdFromMetadata = (metadata: any) => {
  const userId = metadata?.userId ?? metadata?.referenceId ?? metadata?.user_id;
  return typeof userId === 'string' && userId.length > 0 ? userId : null;
};

// 订阅状态更新的公共逻辑
const updateSubscriptionStatus = async (
  status: 'canceled' | 'paused' | 'expired',
  data: any,
) => {
  const { id } = data;
  if (!id) {
    console.error(`[ERR] Subscription ${status}: Missing subscription ID`);
    return;
  }

  const updatePayload: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'canceled') {
    updatePayload.canceledAt = new Date();
  }

  try {
    await subscriptionRepo.updateByPaymentId(id, updatePayload);

    console.log(`[OK] Subscription ${status}: ${id}`);
  } catch (error) {
    console.error(`[ERR] Subscription ${status} handler error:`, error);
    throw error;
  }
};

// 数据访问层：订阅
const subscriptionRepo = {
  async updateByPaymentId(paymentSubscriptionId: string, payload: Record<string, unknown>) {
    return db
      .update(subscription)
      .set(payload)
      .where(eq(subscription.paymentSubscriptionId, paymentSubscriptionId));
  },
  async findByPaymentId(paymentSubscriptionId: string) {
    const [record] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.paymentSubscriptionId, paymentSubscriptionId))
      .limit(1);
    return record;
  },
  async create(payload: {
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
    return db
      .insert(subscription)
      .values({
        userId: payload.userId,
        paymentPlatform: 'creem',
        paymentSubscriptionId: payload.paymentSubscriptionId,
        paymentCustomerId: payload.paymentCustomerId,
        productId: payload.productId,
        planType: payload.planType,
        status: 'active',
        amount: payload.amount,
        currency: payload.currency,
        startedAt: new Date(),
        expiresAt: payload.expiresAt,
        nextBillingAt: payload.nextBillingAt,
      })
      .returning();
  },
  async findActiveByUserId(userId: string) {
    const [active] = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.userId, userId), eq(subscription.status, 'active')))
      .limit(1);
    return active;
  },
  async updateById(subscriptionId: string, payload: Record<string, unknown>) {
    return db.update(subscription).set(payload).where(eq(subscription.id, subscriptionId));
  },
};

// 数据访问层：交易
const transactionRepo = {
  async findByPaymentTransactionId(paymentTransactionId: string) {
    const [existing] = await db
      .select()
      .from(transaction)
      .where(eq(transaction.paymentTransactionId, paymentTransactionId))
      .limit(1);
    return existing;
  },
  async createOneTimePayment(payload: {
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
        paymentPlatform: 'creem',
        paymentTransactionId: payload.paymentTransactionId,
        productId: payload.productId,
        type: 'one_time_payment',
        amount: payload.amount,
        currency: payload.currency,
      })
      .returning();
    return record;
  },
  async createSubscriptionPayment(payload: {
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
        paymentPlatform: 'creem',
        paymentTransactionId: payload.paymentTransactionId,
        productId: payload.productId,
        type: 'subscription_payment',
        amount: payload.amount,
        currency: payload.currency,
      })
      .returning();
    return record;
  },
};

// 数据访问层：积分
const creditRepo = {
  async grantCredits(payload: {
    userId: string;
    transactionId: string;
    type: string;
    amount: number;
    expiresAt: Date | null;
  }) {
    return db.insert(credit).values({
      userId: payload.userId,
      transactionId: payload.transactionId,
      type: payload.type,
      amount: payload.amount,
      consumed: 0,
      issuedAt: new Date(),
      expiresAt: payload.expiresAt,
    });
  },
};

// 数据访问层：用户
const userRepo = {
  async updateCurrentSubscription(userId: string, subscriptionId: string) {
    return db
      .update(user)
      .set({ currentSubscriptionId: subscriptionId, updatedAt: new Date() })
      .where(eq(user.id, userId));
  },
  async updatePlan(userId: string, planType: string, subscriptionId: string) {
    return db
      .update(user)
      .set({ type: planType, currentSubscriptionId: subscriptionId, updatedAt: new Date() })
      .where(eq(user.id, userId));
  },
  async revokeAccess(userId: string) {
    return db
      .update(user)
      .set({ type: 'free', currentSubscriptionId: null, updatedAt: new Date() })
      .where(eq(user.id, userId));
  },
};

// --- 事件处理：一次性点数包购买（写入交易 & 发放积分） ---
async function handleCheckoutCompleted(data: any) {
  const { id, product, metadata, order } = data;

  const billingType = product?.billing_type ?? order?.type;
  if (billingType !== 'one-time' && billingType !== 'onetime') {
    return;
  }

  const userId = getUserIdFromMetadata(metadata);
  const productId = product?.id;
  const creditPack = getCreditPackByProductId(productId || '');

  if (!userId || !productId || !creditPack) {
    console.error('[ERR] Checkout completed: Missing required data', {
      userId,
      productId,
      creditPack,
    });
    return;
  }

  const paymentTransactionId = order?.transaction || order?.id || id;

  try {
    const existingTransaction = await transactionRepo.findByPaymentTransactionId(
      paymentTransactionId,
    );

    if (existingTransaction) {
      console.log(`⚠ Duplicate checkout detected for transaction ${paymentTransactionId}`);
      return;
    }

    const amount = order?.amount_paid ?? order?.amount ?? product?.price ?? 0;
    const currency = order?.currency || product?.currency || 'USD';

    const transactionRecord = await transactionRepo.createOneTimePayment({
      userId,
      paymentTransactionId,
      productId,
      amount,
      currency,
    });

    const expiresAt = new Date(Date.now() + creditPack.validDays * 24 * 60 * 60 * 1000);

    await creditRepo.grantCredits({
      userId,
      transactionId: transactionRecord.id,
      type: `credit_pack_${creditPack.id}`,
      amount: creditPack.credits,
      expiresAt,
    });

    console.log(`[OK] Granted ${creditPack.credits} credits to user ${userId} - Pack: ${creditPack.id}`);
  } catch (error) {
    console.error('[ERR] Checkout completed handler error:', error);
    throw error;
  }
}

// --- 事件处理：订阅激活（创建订阅记录并绑定用户） ---
async function handleSubscriptionActive(data: any) {
  const {
    id,
    customer,
    product,
    next_transaction_date,
    current_period_end_date,
    metadata,
  } = data;

  const userId = getUserIdFromMetadata(metadata);

  if (!product?.id) {
    console.error('[ERR] Subscription active: Missing product ID');
    return;
  }

  const pricingTier = getPricingTierByProductId(product.id);
  if (!pricingTier) {
    console.error('[ERR] Subscription active: Product ID not found in pricing config', {
      productId: product.id,
    });
    return;
  }

  if (!userId || !pricingTier.subscriptionPlanType) {
    console.error('[ERR] Subscription active: Missing required data', {
      userId,
      productId: product.id,
      planInfo: pricingTier,
    });
    return;
  }

  try {
    const [subscriptionRecord] = await subscriptionRepo.create({
      userId,
      paymentSubscriptionId: id,
      paymentCustomerId: customer?.id || '',
      productId: product.id,
      planType: pricingTier.subscriptionPlanType,
      amount: product.price,
      currency: product.currency || 'USD',
      expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
    });

    await userRepo.updateCurrentSubscription(userId, subscriptionRecord.id);

    console.log(`[OK] Created subscription for user ${userId} - Subscription ID: ${id}`);
  } catch (error) {
    console.error('[ERR] Subscription active handler error:', error);
    throw error;
  }
}

// --- 事件处理：订阅支付成功（更新订阅 & 发放周期积分） ---
async function handleSubscriptionPaid(data: any) {
  console.log('handleSubscriptionPaid', data);
  const payload =
    data && typeof data.object === 'object' && data.object !== null ? data.object : data;
  const {
    id,
    product,
    current_period_end_date,
    next_transaction_date,
    metadata,
  } = payload;
  const lastTransaction = payload.last_transaction ?? payload.lastTransaction;
  const lastTransactionId = payload.last_transaction_id ?? payload.lastTransactionId;

  const userId = getUserIdFromMetadata(metadata);

  const resolvedProductId =
    product?.id || payload?.items?.[0]?.product_id || payload?.items?.[0]?.productId;
  if (!resolvedProductId) {
    console.error('[ERR] Subscription paid: Missing product ID');
    return;
  }

  const pricingTier = getPricingTierByProductId(resolvedProductId);
  if (!pricingTier) {
    console.error('[ERR] Subscription paid: Product ID not found in pricing config', {
      productId: resolvedProductId,
    });
    return;
  }

  if (!userId || !pricingTier.subscriptionPlanType) {
    console.error('[ERR] Subscription paid: Missing required data', {
      userId,
      productId: resolvedProductId,
      pricingTier,
    });
    return;
  }

  const quotaAmount = getSubscriptionQuota(pricingTier.subscriptionPlanType);

  try {
    let existingSubscription = await subscriptionRepo.findByPaymentId(id);
    if (!existingSubscription) {
      existingSubscription = await subscriptionRepo.findActiveByUserId(userId);
    }

    if (!existingSubscription) {
      const [subscriptionRecord] = await subscriptionRepo.create({
        userId,
        paymentSubscriptionId: id,
        paymentCustomerId: payload.customer?.id || '',
        productId: resolvedProductId,
        planType: pricingTier.subscriptionPlanType,
        amount: product.price,
        currency: product.currency || 'USD',
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
        nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
      });
      existingSubscription = subscriptionRecord;
      await userRepo.updateCurrentSubscription(userId, subscriptionRecord.id);
    }

    const paymentTransactionId = lastTransactionId || lastTransaction?.id;
    const paidAmount = Number(
      lastTransaction?.amount_paid ?? lastTransaction?.amountPaid ?? lastTransaction?.amount ?? 0,
    );
    const existingTransaction = paymentTransactionId
      ? await transactionRepo.findByPaymentTransactionId(paymentTransactionId)
      : null;

    await subscriptionRepo.updateById(existingSubscription.id, {
      productId: resolvedProductId,
      planType: pricingTier.subscriptionPlanType,
      amount: product.price,
      currency: product.currency,
      expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
      updatedAt: new Date(),
    });

    await userRepo.updatePlan(userId, pricingTier.planType, existingSubscription.id);

    console.log(
      `[OK] Subscription updated: ${id} - Plan: ${pricingTier.subscriptionPlanType}, Quota: ${quotaAmount}`,
    );

    if (paidAmount > 0 && paymentTransactionId) {
      if (existingTransaction) {
        console.log(
          `⚠ Duplicate transaction detected: ${paymentTransactionId}`,
        );
        return;
      }
      const transactionRecord = await transactionRepo.createSubscriptionPayment({
        userId,
        subscriptionId: existingSubscription.id,
        paymentTransactionId,
        productId: resolvedProductId,
        amount: paidAmount,
        currency: lastTransaction?.currency || 'USD',
      });

      console.log(
        `[OK] Created transaction ${transactionRecord.id} - Amount paid: ${paidAmount} ${lastTransaction?.currency || 'USD'}`,
      );

      await creditRepo.grantCredits({
        userId,
        transactionId: transactionRecord.id,
        type: pricingTier.subscriptionPlanType,
        amount: quotaAmount,
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      });

      console.log(
        `[OK] Granted ${quotaAmount} quota to user ${userId} - Plan: ${pricingTier.subscriptionPlanType}`,
      );
    } else {
      console.log(
        `⚠ No quota granted: amount_paid is ${paidAmount}`,
      );
    }
  } catch (error) {
    console.error('[ERR] Subscription paid handler error:', error);
    throw error;
  }
}

// 订阅取消
async function handleSubscriptionCanceled(data: any) {
  await updateSubscriptionStatus('canceled', data);
}

// 订阅过期
async function handleSubscriptionExpired(data: any) {
  await updateSubscriptionStatus('expired', data);
}

// 订阅暂停
async function handleSubscriptionPaused(data: any) {
  await updateSubscriptionStatus('paused', data);
}

// 授权回调：当前未实现业务逻辑
async function handleGrantAccess() {
  return;
}

// 撤销访问权限：降级为免费用户
async function handleRevokeAccess(data: any) {
  const { reason, customer, product, metadata } = data;
  const userId = getUserIdFromMetadata(metadata);

  console.log(
    `Revoke access: ${reason} - User: ${userId}, Email: ${customer?.email}, Product: ${product?.name}`,
  );

  if (!userId) {
    console.error('[ERR] Revoke access: Missing user ID');
    return;
  }

  try {
    await userRepo.revokeAccess(userId);

    console.log(`[OK] Revoked access from user ${userId} (${customer?.email})`);
  } catch (error) {
    console.error('[ERR] Revoke access handler error:', error);
    throw error;
  }
}

export const createCreemWebhookHandlers = (): CreemWebhookHandlers => ({
  onCheckoutCompleted: handleCheckoutCompleted,
  onSubscriptionActive: handleSubscriptionActive,
  onSubscriptionCanceled: handleSubscriptionCanceled,
  onSubscriptionExpired: handleSubscriptionExpired,
  onSubscriptionPaid: handleSubscriptionPaid,
  onSubscriptionPaused: handleSubscriptionPaused,
  onGrantAccess: handleGrantAccess,
  onRevokeAccess: handleRevokeAccess,
});
