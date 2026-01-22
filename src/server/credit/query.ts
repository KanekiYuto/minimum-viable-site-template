/**
 * 积分查询模块
 */

import { db } from "@/server/db";
import { credit } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * 获取用户当前可用积分总数
 */
export async function getAvailableCredit(userId: string): Promise<number> {
  try {
    const now = new Date();

    const userCredits = await db
      .select()
      .from(credit)
      .where(eq(credit.userId, userId));

    const validCredits = userCredits.filter((c) => {
      return c.expiresAt === null || c.expiresAt >= now;
    });

    const totalAvailable = validCredits.reduce((sum, c) => {
      return sum + (c.amount - c.consumed);
    }, 0);

    return Math.max(0, totalAvailable);
  } catch (error) {
    console.error("Get available credit error:", error);
    return 0;
  }
}

/**
 * 获取用户所有积分记录（包括已过期）
 */
export async function getAllUserCredits(userId: string) {
  try {
    return await db.select().from(credit).where(eq(credit.userId, userId));
  } catch (error) {
    console.error("Get all user credits error:", error);
    return [];
  }
}
