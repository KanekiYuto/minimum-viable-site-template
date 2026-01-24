import { NextResponse, NextRequest } from "next/server";
import { getSessionUserId } from "@/server/auth-utils";
import { listRecentCreditTransactions } from "@/server/db/services/credit-transaction";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await listRecentCreditTransactions(userId, 100);

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
