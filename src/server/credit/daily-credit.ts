import { db } from "@/server/db";
import { credit } from "@/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { creditConfig, getDailyFreeCredit, type UserType } from "./config";

/**
 * 检查并下发每日免费积分
 */
export async function checkAndIssueDailyCredit(
  userId: string,
  userType: UserType
): Promise<boolean> {
  if (userType !== creditConfig.userTypes.free) {
    return false;
  }

  try {
    const now = new Date();

    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
    );
    const todayEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    const existingCredit = await db
      .select()
      .from(credit)
      .where(
        and(
          eq(credit.userId, userId),
          eq(credit.type, creditConfig.creditTypes.dailyFree),
          gte(credit.issuedAt, todayStart)
        )
      )
      .limit(1);

    if (existingCredit.length > 0) {
      return false;
    }

    const creditAmount = getDailyFreeCredit();

    await db.insert(credit).values({
      userId,
      type: creditConfig.creditTypes.dailyFree,
      amount: creditAmount,
      consumed: 0,
      issuedAt: new Date(),
      expiresAt: todayEnd,
    });

    return true;
  } catch (error) {
    console.error("Failed to issue daily credit:", error);
    return false;
  }
}
