import { NextResponse } from "next/server";
import { getSessionUserId } from "@/server/auth-utils";
import { listCreditTransactionsPaginated } from "@/server/db/services/credit-transaction";

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

    const result = await listCreditTransactionsPaginated({
      userId,
      page,
      pageSize,
      type,
    });

    return NextResponse.json({
      records: result.records,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error("Failed to fetch usage records:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage records" },
      { status: 500 }
    );
  }
}
