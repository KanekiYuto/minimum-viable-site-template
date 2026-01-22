import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { creditTransaction, credit } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/server/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await db
      .select({
        id: creditTransaction.id,
        type: creditTransaction.type,
        amount: creditTransaction.amount,
        balanceBefore: creditTransaction.balanceBefore,
        balanceAfter: creditTransaction.balanceAfter,
        note: creditTransaction.note,
        createdAt: creditTransaction.createdAt,
        creditId: creditTransaction.creditId,
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(100);

    const credits = await db
      .select({
        id: credit.id,
        type: credit.type,
      })
      .from(credit)
      .where(eq(credit.userId, userId));

    const creditTypeMap = new Map(credits.map((c) => [c.id, c.type]));

    const records = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
      creditType: creditTypeMap.get(t.creditId) || "unknown",
    }));

    return NextResponse.json({
      records,
      total: records.length,
    });
  } catch (error) {
    console.error("Failed to fetch usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage records" },
      { status: 500 }
    );
  }
}
