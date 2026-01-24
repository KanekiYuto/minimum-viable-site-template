import { NextResponse, NextRequest } from "next/server";
import { getSessionUserId } from "@/server/auth-utils";
import { getCreditUsageStats } from "@/server/db/services/credit-transaction";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { totalConsumed, totalRecords, avgPerRecord } =
      await getCreditUsageStats(userId);

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
