import { NextRequest, NextResponse } from "next/server";
import { getCreemClient } from "@extensions/payment/core/creem-client";
import { getSessionUserId } from "@/server/auth-utils";
import { getCreemRuntimeConfigFromEnv } from "@/server/payment/runtime-config";
import { findOwnedSubscriptionByUserAndCustomerId } from "@/server/db/services/subscription";

/**
 * Creem 客户门户路由（服务端生成门户链接并重定向）
 *
 * 使用方式：`/portal?customerId=cust_xxx`
 */
export async function GET(request: NextRequest) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = request.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  const ownedSubscription = await findOwnedSubscriptionByUserAndCustomerId(userId, customerId);

  if (!ownedSubscription) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const creem = getCreemClient(getCreemRuntimeConfigFromEnv());

  // 使用 creem_io SDK：customers.createPortal -> { customerPortalLink }
  const portal = await creem.customers.createPortal({ customerId });

  return NextResponse.redirect(portal.customerPortalLink);
}
