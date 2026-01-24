import { db } from "@/server/db";
import { credit, creditTransaction } from "@/server/db/schema";
import { and, count, desc, eq } from "drizzle-orm";

/**
 * 获取用户的积分流水（最近 N 条，带 creditType）
 */
export async function listRecentCreditTransactions(userId: string, limit: number = 100) {
  const rows = await db
    .select({
      id: creditTransaction.id,
      type: creditTransaction.type,
      amount: creditTransaction.amount,
      balanceBefore: creditTransaction.balanceBefore,
      balanceAfter: creditTransaction.balanceAfter,
      note: creditTransaction.note,
      createdAt: creditTransaction.createdAt,
      creditType: credit.type,
    })
    .from(creditTransaction)
    .innerJoin(credit, eq(creditTransaction.creditId, credit.id))
    .where(eq(creditTransaction.userId, userId))
    .orderBy(desc(creditTransaction.createdAt))
    .limit(limit);

  return rows.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    balanceBefore: t.balanceBefore,
    balanceAfter: t.balanceAfter,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
    creditType: t.creditType || "unknown",
  }));
}

/**
 * 分页获取积分流水（带 creditType）
 */
export async function listCreditTransactionsPaginated(payload: {
  userId: string;
  page: number;
  pageSize: number;
  type?: string;
}) {
  const where = [
    eq(creditTransaction.userId, payload.userId),
    ...(payload.type && payload.type !== "all"
      ? [eq(creditTransaction.type, payload.type)]
      : []),
  ];

  const [{ total }] = await db
    .select({ total: count() })
    .from(creditTransaction)
    .where(where.length > 1 ? and(...where) : where[0]);

  const totalCount = Number(total || 0);
  const totalPages = Math.ceil(totalCount / payload.pageSize);
  const offset = (payload.page - 1) * payload.pageSize;

  const rows = await db
    .select({
      id: creditTransaction.id,
      type: creditTransaction.type,
      amount: creditTransaction.amount,
      balanceBefore: creditTransaction.balanceBefore,
      balanceAfter: creditTransaction.balanceAfter,
      note: creditTransaction.note,
      createdAt: creditTransaction.createdAt,
      creditType: credit.type,
    })
    .from(creditTransaction)
    .innerJoin(credit, eq(creditTransaction.creditId, credit.id))
    .where(where.length > 1 ? and(...where) : where[0])
    .orderBy(desc(creditTransaction.createdAt))
    .limit(payload.pageSize)
    .offset(offset);

  const records = rows.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    balanceBefore: t.balanceBefore,
    balanceAfter: t.balanceAfter,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
    creditType: t.creditType || "unknown",
  }));

  return {
    records,
    totalPages,
    currentPage: payload.page,
    pageSize: payload.pageSize,
    totalCount,
  };
}

/**
 * 获取积分使用统计
 */
export async function getCreditUsageStats(userId: string) {
  const transactions = await db
    .select({
      type: creditTransaction.type,
      amount: creditTransaction.amount,
    })
    .from(creditTransaction)
    .where(eq(creditTransaction.userId, userId));

  const totalConsumed = transactions
    .filter((t) => t.type === "consume")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalRecords = transactions.length;
  const consumeRecords = transactions.filter((t) => t.type === "consume");
  const avgPerRecord =
    consumeRecords.length > 0 ? Math.round(totalConsumed / consumeRecords.length) : 0;

  return { totalConsumed, totalRecords, avgPerRecord };
}

/**
 * 获取单条积分流水
 */
export async function getCreditTransactionById(creditTransactionId: string) {
  const [record] = await db
    .select()
    .from(creditTransaction)
    .where(eq(creditTransaction.id, creditTransactionId))
    .limit(1);

  return record ?? null;
}

/**
 * 查询是否存在关联退款记录
 */
export async function hasRefundForTransaction(consumeTransactionId: string) {
  const existing = await db
    .select({ id: creditTransaction.id })
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.relatedTransactionId, consumeTransactionId),
        eq(creditTransaction.type, "refund"),
      ),
    )
    .limit(1);

  return existing.length > 0;
}

/**
 * 创建积分流水
 */
export async function createCreditTransaction(payload: {
  userId: string;
  creditId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedTransactionId?: string | null;
  note?: string | null;
}) {
  const [record] = await db
    .insert(creditTransaction)
    .values({
      userId: payload.userId,
      creditId: payload.creditId,
      type: payload.type,
      amount: payload.amount,
      balanceBefore: payload.balanceBefore,
      balanceAfter: payload.balanceAfter,
      relatedTransactionId: payload.relatedTransactionId ?? null,
      note: payload.note ?? null,
    })
    .returning();

  return record ?? null;
}

