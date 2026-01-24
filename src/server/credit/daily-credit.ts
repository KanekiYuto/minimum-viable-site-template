import { creditConfig, getDailyFreeCredit, type UserType } from "./config";
import { grantCredits, hasCreditIssuedSince } from "@/server/db/services/credit";

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

    const hasIssued = await hasCreditIssuedSince(
      userId,
      creditConfig.creditTypes.dailyFree,
      todayStart
    );

    if (hasIssued) {
      return false;
    }

    const creditAmount = getDailyFreeCredit();

    await grantCredits({
      userId,
      transactionId: null,
      type: creditConfig.creditTypes.dailyFree,
      amount: creditAmount,
      expiresAt: todayEnd,
      issuedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Failed to issue daily credit:", error);
    return false;
  }
}
