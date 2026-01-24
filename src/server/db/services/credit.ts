import { db } from "@/server/db";
import { credit } from "@/server/db/schema";
import { and, eq, gt, gte, isNull, or, sql } from "drizzle-orm";

/**
 * 获取用户全部积分记录
 */
export async function listUserCredits(userId: string) {
  return db.select().from(credit).where(eq(credit.userId, userId));
}

/**
 * 获取用户当前可用积分总数（DB 聚合，避免拉取全量记录）
 */
export async function getAvailableCreditTotal(userId: string, now: Date = new Date()) {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${credit.amount} - ${credit.consumed}), 0)`,
    })
    .from(credit)
    .where(
      and(
        eq(credit.userId, userId),
        gt(credit.amount, credit.consumed),
        or(isNull(credit.expiresAt), gte(credit.expiresAt, now)),
      ),
    );

  return Number(row?.total ?? 0);
}

/**
 * 获取可用于消费的积分记录（未过期且有剩余，按发放时间升序）
 */
export async function listConsumableCredits(userId: string, now: Date = new Date()) {
  return db
    .select()
    .from(credit)
    .where(
      and(
        eq(credit.userId, userId),
        gt(credit.amount, credit.consumed),
        or(isNull(credit.expiresAt), gt(credit.expiresAt, now)),
      ),
    )
    .orderBy(credit.issuedAt);
}

/**
 * 更新某条积分记录的 consumed
 */
export async function updateCreditConsumed(creditId: string, consumed: number) {
  return db
    .update(credit)
    .set({ consumed, updatedAt: new Date() })
    .where(eq(credit.id, creditId));
}

/**
 * 获取单条积分记录
 */
export async function getCreditById(creditId: string) {
  const [record] = await db
    .select()
    .from(credit)
    .where(eq(credit.id, creditId))
    .limit(1);

  return record ?? null;
}

/**
 * 查询某时间点之后是否已发放过某类型积分
 */
export async function hasCreditIssuedSince(userId: string, type: string, since: Date) {
  const existing = await db
    .select({ id: credit.id })
    .from(credit)
    .where(and(eq(credit.userId, userId), eq(credit.type, type), gte(credit.issuedAt, since)))
    .limit(1);

  return existing.length > 0;
}

/**
 * 发放积分（可设置过期时间；transactionId 可为空）
 */
export async function grantCredits(payload: {
  userId: string;
  transactionId: string | null;
  type: string;
  amount: number;
  expiresAt: Date | null;
  issuedAt?: Date;
}) {
  return db.insert(credit).values({
    userId: payload.userId,
    transactionId: payload.transactionId,
    type: payload.type,
    amount: payload.amount,
    consumed: 0,
    issuedAt: payload.issuedAt ?? new Date(),
    expiresAt: payload.expiresAt,
  });
}
