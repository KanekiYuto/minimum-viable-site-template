import createMiddleware from "next-intl/middleware";
import { extensionsConfig } from "@config/extensions";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
    // 匹配所有路径，除了:
    // - API 路由 (/api/*)
    // - Next.js 内部路由 (/_next/*)
    // - Vercel 路由 (/_vercel/*)
    // - .well-known 目录 (/.well-known/*)
    // - 静态资源 (带扩展名的文件，如 .js, .css, .png 等)
    matcher: [
        '/((?!api|_next|_vercel|\\.well-known|.*\\.[a-zA-Z0-9]+$).*)'
    ],
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
