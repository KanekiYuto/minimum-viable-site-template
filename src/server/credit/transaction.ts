/**
 * 积分交易管理模块
 */

import { db } from "@/server/db";
import { credit, creditTransaction } from "@/server/db/schema";
import { eq, and, gt, or, isNull } from "drizzle-orm";

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

    const availableCredits = await db
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          gt(credit.amount, credit.consumed),
          or(isNull(credit.expiresAt), gt(credit.expiresAt, new Date()))
        )
      )
      .orderBy(credit.issuedAt);

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

      await db
        .update(credit)
        .set({
          consumed: creditRecord.consumed + toConsume,
          updatedAt: new Date(),
        })
        .where(eq(credit.id, creditRecord.id));

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

    const [transaction] = await db
      .insert(creditTransaction)
      .values({
        userId,
        creditId: selectedCreditId,
        type: "consume",
        amount: -amount,
        balanceBefore,
        balanceAfter,
        note,
      })
      .returning();

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
    const [consumeTransaction] = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.id, consumeTransactionId));

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

    const existingRefunds = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.relatedTransactionId, consumeTransactionId),
          eq(creditTransaction.type, "refund")
        )
      );

    if (existingRefunds.length > 0) {
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

    const [targetCredit] = await db
      .select()
      .from(credit)
      .where(eq(credit.id, consumeTransaction.creditId));

    if (!targetCredit) {
      return {
        success: false,
        error: "Credit record not found",
      };
    }

    const balanceBefore = targetCredit.amount - targetCredit.consumed;

    await db
      .update(credit)
      .set({
        consumed: Math.max(0, targetCredit.consumed - refundAmount),
        updatedAt: new Date(),
      })
      .where(eq(credit.id, targetCredit.id));

    const balanceAfter = balanceBefore + refundAmount;

    const [refundTransaction] = await db
      .insert(creditTransaction)
      .values({
        userId: consumeTransaction.userId,
        creditId: targetCredit.id,
        type: "refund",
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        relatedTransactionId: consumeTransactionId,
        note,
      })
      .returning();

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
