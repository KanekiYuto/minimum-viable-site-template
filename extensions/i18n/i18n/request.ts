import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // 验证语言是否支持，否则使用默认语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  let messages = {};
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    // 未生成合并后的 messages 文件时，返回空对象以避免运行时报错
    messages = {};
  }

  return {
    locale,
    messages,
  };
});
