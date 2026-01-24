import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/server/auth-utils";
import { listSubscriptionsByUserId } from "@/server/db/services/subscription";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscriptions = await listSubscriptionsByUserId(userId);

    return NextResponse.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
