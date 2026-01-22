import { NextRequest, NextResponse } from "next/server";
import { getAvailableCredit, getAllUserCredits } from "@/server/credit/query";
import { getSessionUserId } from "@/server/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCredits = await getAllUserCredits(userId);
    const totalRemaining = await getAvailableCredit(userId);
    const totalConsumed = userCredits.reduce((sum, c) => sum + c.consumed, 0);

    const now = new Date();
    const activeCredits = userCredits.filter((c) => {
      const isNotExpired = c.expiresAt === null || c.expiresAt >= now;
      const hasRemaining = c.amount - c.consumed > 0;
      return isNotExpired && hasRemaining;
    });

    const credits = userCredits.map((c) => ({
      id: c.id,
      type: c.type,
      amount: c.amount,
      consumed: c.consumed,
      remaining: c.amount - c.consumed,
      issuedAt: c.createdAt.toISOString(),
      expiresAt: c.expiresAt?.toISOString() || null,
    }));

    return NextResponse.json({
      credits,
      summary: {
        totalRemaining,
        totalConsumed,
        activeCreditsCount: activeCredits.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch credit balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit balance" },
      { status: 500 }
    );
  }
}
