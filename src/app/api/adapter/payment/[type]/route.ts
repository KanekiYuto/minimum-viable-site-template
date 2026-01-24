import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { searchParams } = request.nextUrl;
  const { type } = await params;

  const sku = searchParams.get("sku");
  const productId = searchParams.get("product_id");

  const redirectUrl = new URL("/payment/success", request.nextUrl.origin);
  if (type) redirectUrl.searchParams.set("type", type);
  if (sku) redirectUrl.searchParams.set("sku", sku);
  if (productId) redirectUrl.searchParams.set("p_id", productId);

  return NextResponse.redirect(redirectUrl);
}

