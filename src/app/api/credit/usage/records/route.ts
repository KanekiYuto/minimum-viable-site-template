import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { creditTransaction, credit } from "@/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSessionUserId } from "@/server/auth-utils";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));
    const type = searchParams.get("type") || "all";

    const whereConditions = [eq(creditTransaction.userId, userId)];
    if (type !== "all") {
      whereConditions.push(eq(creditTransaction.type, type));
    }

    const countResult = await db
      .select({ count: creditTransaction.id })
      .from(creditTransaction)
      .where(and(...whereConditions));

    const totalCount = countResult.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;

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
      .where(and(...whereConditions))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(pageSize)
      .offset(offset);

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
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    });
  } catch (error) {
    console.error("Failed to fetch usage records:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage records" },
      { status: 500 }
    );
  }
}
