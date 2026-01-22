import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { subscription } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUserId } from "@/server/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [currentSubscription] = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.status, "active")
        )
      )
      .orderBy(subscription.createdAt)
      .limit(1);

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
