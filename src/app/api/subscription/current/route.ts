import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/server/auth-utils";
import { getCurrentActiveSubscriptionByUserId } from "@/server/db/services/subscription";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentSubscription = await getCurrentActiveSubscriptionByUserId(userId);

    if (!currentSubscription) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: currentSubscription,
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
