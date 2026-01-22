import createMiddleware from "next-intl/middleware";
import { extensionsConfig } from "@config/extensions";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next|_vercel|\\.well-known|.*\\.[a-zA-Z0-9]+$).*)"],
};

const { i18n } = extensionsConfig;

let intlMiddleware: ReturnType<typeof createMiddleware> | null = null;
try {
  intlMiddleware = createMiddleware({
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    localePrefix: i18n.localePrefix,
    localeDetection: i18n.localeDetection,
    alternateLinks: i18n.alternateLinks,
  });
} catch (error) {
  console.error("[proxy] Failed to init i18n middleware:", error);
  intlMiddleware = null;
}

export default async function proxy(request: NextRequest) {
  if (!intlMiddleware) {
    return NextResponse.next();
  }

  try {
    return intlMiddleware(request);
  } catch (error) {
    console.error("[proxy] i18n middleware error:", error);
    return NextResponse.next();
  }
}
