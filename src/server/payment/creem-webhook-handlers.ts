/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSubscriptionQuota } from "@/shared/payment/entitlements/subscription";
import {
  getCreditPackByCreemProductId,
  getSubscriptionByCreemProductId,
} from "@/server/payment/providers/creem/mapping";
import type { CreemWebhookHandlers } from '@extensions/payment/core/webhooks/creem';
import * as creditService from '@/server/db/services/credit';
import * as subscriptionService from '@/server/db/services/subscription';
import * as transactionService from '@/server/db/services/transaction';
import * as userService from '@/server/db/services/user';

/**
 * 回调处理器（Webhook，Creem；服务端落库/发放积分）。
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
    await subscriptionService.updateSubscriptionByPaymentId(id, updatePayload);

    console.log(`[OK] Subscription ${status}: ${id}`);
  } catch (error) {
    console.error(`[ERR] Subscription ${status} handler error:`, error);
    throw error;
  }
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
  const creditPack = getCreditPackByCreemProductId(productId || "");

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
    const existingTransaction = await transactionService.findTransactionByPaymentTransactionId(
      paymentTransactionId,
    );

    if (existingTransaction) {
      console.log(`[WARN] Duplicate checkout detected for transaction ${paymentTransactionId}`);
      return;
    }

    const amount = order?.amount_paid ?? order?.amount ?? product?.price ?? 0;
    const currency = order?.currency || product?.currency || 'USD';

    const transactionRecord = await transactionService.createOneTimePaymentTransaction({
      userId,
      paymentTransactionId,
      productId,
      amount,
      currency,
    });

    if (!transactionRecord) {
      throw new Error('Failed to create transaction record');
    }

    const expiresAt = new Date(Date.now() + creditPack.validDays * 24 * 60 * 60 * 1000);

    await creditService.grantCredits({
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

  const subscriptionPlan = getSubscriptionByCreemProductId(product.id);
  if (!subscriptionPlan) {
    console.error('[ERR] Subscription active: Product ID not found in pricing config', {
      productId: product.id,
    });
    return;
  }

  if (!userId) {
    console.error('[ERR] Subscription active: Missing required data', {
      userId,
      productId: product.id,
      planInfo: subscriptionPlan,
    });
    return;
  }

  try {
    const subscriptionRecord = await subscriptionService.createSubscription({
      userId,
      paymentSubscriptionId: id,
      paymentCustomerId: customer?.id || '',
      productId: product.id,
      planType: subscriptionPlan.subscriptionSku,
      amount: product.price,
      currency: product.currency || 'USD',
      expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
    });

    if (!subscriptionRecord) {
      throw new Error('Failed to create subscription record');
    }

    await userService.updateUserCurrentSubscription(userId, subscriptionRecord.id);

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

  const subscriptionPlan = getSubscriptionByCreemProductId(resolvedProductId);
  if (!subscriptionPlan) {
    console.error('[ERR] Subscription paid: Product ID not found in pricing config', {
      productId: resolvedProductId,
    });
    return;
  }

  if (!userId) {
    console.error('[ERR] Subscription paid: Missing required data', {
      userId,
      productId: resolvedProductId,
      subscriptionPlan,
    });
    return;
  }

  const quotaAmount = getSubscriptionQuota(subscriptionPlan.subscriptionSku);

  try {
    let existingSubscription = await subscriptionService.findSubscriptionByPaymentId(id);
    if (!existingSubscription) {
      existingSubscription = await subscriptionService.findActiveSubscriptionByUserId(userId);
    }

    if (!existingSubscription) {
      const subscriptionRecord = await subscriptionService.createSubscription({
        userId,
        paymentSubscriptionId: id,
        paymentCustomerId: payload.customer?.id || '',
        productId: resolvedProductId,
        planType: subscriptionPlan.subscriptionSku,
        amount: product.price,
        currency: product.currency || 'USD',
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
        nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
      });

      if (!subscriptionRecord) {
        throw new Error('Failed to create subscription record');
      }

      existingSubscription = subscriptionRecord;
      await userService.updateUserCurrentSubscription(userId, subscriptionRecord.id);
    }

    const paymentTransactionId = lastTransactionId || lastTransaction?.id;
    const paidAmount = Number(
      lastTransaction?.amount_paid ?? lastTransaction?.amountPaid ?? lastTransaction?.amount ?? 0,
    );
    const existingTransaction = paymentTransactionId
      ? await transactionService.findTransactionByPaymentTransactionId(paymentTransactionId)
      : null;

    await subscriptionService.updateSubscriptionById(existingSubscription.id, {
      productId: resolvedProductId,
      planType: subscriptionPlan.subscriptionSku,
      amount: product.price,
      currency: product.currency,
      expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
      updatedAt: new Date(),
    });

    await userService.updateUserPlan(userId, subscriptionPlan.planType, existingSubscription.id);

    console.log(
      `[OK] Subscription updated: ${id} - Plan: ${subscriptionPlan.subscriptionSku}, Quota: ${quotaAmount}`,
    );

    if (paidAmount > 0 && paymentTransactionId) {
      if (existingTransaction) {
        console.log(
          `[WARN] Duplicate transaction detected: ${paymentTransactionId}`,
        );
        return;
      }
      const transactionRecord = await transactionService.createSubscriptionPaymentTransaction({
        userId,
        subscriptionId: existingSubscription.id,
        paymentTransactionId,
        productId: resolvedProductId,
        amount: paidAmount,
        currency: lastTransaction?.currency || 'USD',
      });

      if (!transactionRecord) {
        throw new Error('Failed to create transaction record');
      }

      console.log(
        `[OK] Created transaction ${transactionRecord.id} - Amount paid: ${paidAmount} ${lastTransaction?.currency || 'USD'}`,
      );

      await creditService.grantCredits({
        userId,
        transactionId: transactionRecord.id,
        type: subscriptionPlan.subscriptionSku,
        amount: quotaAmount,
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      });

      console.log(
        `[OK] Granted ${quotaAmount} quota to user ${userId} - Plan: ${subscriptionPlan.subscriptionSku}`,
      );
    } else {
      console.log(
        `[WARN] No quota granted: amount_paid is ${paidAmount}`,
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
    await userService.revokeUserAccess(userId);

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
