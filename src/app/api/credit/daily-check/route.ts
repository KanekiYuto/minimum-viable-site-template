import { NextRequest, NextResponse } from "next/server";
import { checkAndIssueDailyCredit } from "@/server/credit/daily-credit";
import { getUserType } from "@/server/db/services/user";
import type { UserType } from "@/server/credit/config";
import { getSessionUserId } from "@/server/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userType = (await getUserType(userId)) as UserType;
    const issued = await checkAndIssueDailyCredit(userId, userType);

    return NextResponse.json({
      success: true,
      issued,
      message: issued ? "Daily credit issued" : "Daily credit already issued",
    });
  } catch (error) {
    console.error("Daily credit check failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
