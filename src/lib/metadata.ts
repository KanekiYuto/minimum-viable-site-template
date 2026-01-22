import { siteConfig } from "@/config/site";
import { defaultLocale } from "@i18n/config";

/**
 * 生成带语言前缀的路径
 */
function getLocalizedPath(locale: string, path: string, isRootPath: boolean): string {
  // 默认语言不添加语言前缀
  if (locale === defaultLocale) {
    return isRootPath ? "/" : path;
  }

  if (isRootPath) {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

/**
 * 标准化路径，确保以 / 开头
 */
function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * 构建完整 URL
 */
function buildUrl(locale: string, path: string, isRootPath: boolean): string {
  const localePath = getLocalizedPath(locale, path, isRootPath);
  return `${siteConfig.url || ""}${localePath}`;
}

/**
 * 生成页面的 alternates 配置（canonical URL 和 hreflang 标签）
 * @param locale 当前页面的语言
 * @param path 页面路径（不包含 locale 前缀），例如: '/', '/help', '/pricing'
 */
export function generateAlternates(locale: string, path: string = "/") {
  const normalizedPath = normalizePath(path);
  const isRootPath = normalizedPath === "/";

  const languages = Object.fromEntries(
    siteConfig.locales.map((localeName) => [
      localeName,
      buildUrl(localeName, normalizedPath, isRootPath),
    ])
  );

  // x-default 指向不带语言前缀的路径
  const defaultUrl = isRootPath ? siteConfig.url || "" : `${siteConfig.url || ""}${normalizedPath}`;
  languages["x-default"] = defaultUrl;

  return {
    canonical: buildUrl(locale, normalizedPath, isRootPath),
    languages,
  };
}
