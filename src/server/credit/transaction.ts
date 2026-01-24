/**
 * 积分交易管理模块
 */

import {
  getCreditById,
  listConsumableCredits,
  updateCreditConsumed,
} from "@/server/db/services/credit";
import {
  createCreditTransaction,
  getCreditTransactionById,
  hasRefundForTransaction,
} from "@/server/db/services/credit-transaction";

export interface ConsumeCreditResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface RefundCreditResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * 消费积分
 */
export async function consumeCredit(
  userId: string,
  amount: number,
  note: string
): Promise<ConsumeCreditResult> {
  try {
    if (amount <= 0) {
      return {
        success: false,
        error: "Amount must be greater than 0",
      };
    }

    const availableCredits = await listConsumableCredits(userId);

    if (availableCredits.length === 0) {
      return {
        success: false,
        error: "No available credit records",
      };
    }

    const totalAvailable = availableCredits.reduce(
      (sum, c) => sum + (c.amount - c.consumed),
      0
    );

    if (totalAvailable < amount) {
      return {
        success: false,
        error: "Insufficient credits",
      };
    }

    let remainingToConsume = amount;
    let selectedCreditId: string | null = null;
    let balanceBefore = 0;
    let balanceAfter = 0;

    for (const creditRecord of availableCredits) {
      if (remainingToConsume <= 0) break;

      const available = creditRecord.amount - creditRecord.consumed;
      const toConsume = Math.min(available, remainingToConsume);

      if (!selectedCreditId) {
        selectedCreditId = creditRecord.id;
        balanceBefore = available;
      }

      await updateCreditConsumed(creditRecord.id, creditRecord.consumed + toConsume);

      remainingToConsume -= toConsume;

      if (creditRecord.id === selectedCreditId) {
        balanceAfter = balanceBefore - toConsume;
      }
    }

    if (!selectedCreditId) {
      return {
        success: false,
        error: "Failed to select credit record",
      };
    }

    const transaction = await createCreditTransaction({
      userId,
      creditId: selectedCreditId,
      type: "consume",
      amount: -amount,
      balanceBefore,
      balanceAfter,
      note,
    });

    if (!transaction) {
      return {
        success: false,
        error: "Failed to create transaction record",
      };
    }

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error("Consume credit error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to consume credit",
    };
  }
}

/**
 * 退款积分
 */
export async function refundCredit(
  consumeTransactionId: string,
  note: string
): Promise<RefundCreditResult> {
  try {
    const consumeTransaction = await getCreditTransactionById(consumeTransactionId);

    if (!consumeTransaction) {
      return {
        success: false,
        error: "Consume transaction not found",
      };
    }

    if (consumeTransaction.type !== "consume") {
      return {
        success: false,
        error: "Transaction is not a consume type",
      };
    }

    const alreadyRefunded = await hasRefundForTransaction(consumeTransactionId);
    if (alreadyRefunded) {
      return {
        success: false,
        error: "Transaction has already been refunded",
      };
    }

    const refundAmount = Math.abs(consumeTransaction.amount);

    if (refundAmount <= 0) {
      return {
        success: false,
        error: "Invalid refund amount",
      };
    }

    const targetCredit = await getCreditById(consumeTransaction.creditId);

    if (!targetCredit) {
      return {
        success: false,
        error: "Credit record not found",
      };
    }

    const balanceBefore = targetCredit.amount - targetCredit.consumed;

    await updateCreditConsumed(
      targetCredit.id,
      Math.max(0, targetCredit.consumed - refundAmount)
    );

    const balanceAfter = balanceBefore + refundAmount;

    const refundTransaction = await createCreditTransaction({
      userId: consumeTransaction.userId,
      creditId: targetCredit.id,
      type: "refund",
      amount: refundAmount,
      balanceBefore,
      balanceAfter,
      relatedTransactionId: consumeTransactionId,
      note,
    });

    if (!refundTransaction) {
      return {
        success: false,
        error: "Failed to create refund transaction",
      };
    }

    return {
      success: true,
      transactionId: refundTransaction.id,
    };
  } catch (error) {
    console.error("Refund credit error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to refund credit",
    };
  }
}
