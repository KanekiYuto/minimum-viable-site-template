import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { creditTransaction } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/server/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      consumeRecords.length > 0
        ? Math.round(totalConsumed / consumeRecords.length)
        : 0;

    return NextResponse.json({
      totalConsumed,
      totalRecords,
      avgPerRecord,
    });
  } catch (error) {
    console.error("Failed to fetch usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
