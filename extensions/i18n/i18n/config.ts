/**
 * 语言配置 - 统一从 config/extensions.ts 读取
 */
import { extensionsConfig } from "@config/extensions";

const { i18n } = extensionsConfig;

export const locales = i18n.locales as readonly string[];
export type Locale = (typeof locales)[number];

export const defaultLocale = i18n.defaultLocale as Locale;

export const localeNames = i18n.localeNames as Record<Locale, string>;

// RTL 语言列表
export const rtlLocales = i18n.rtlLocales as readonly Locale[];

export const localePrefix = i18n.localePrefix;
export const localeDetection = i18n.localeDetection;
export const alternateLinks = i18n.alternateLinks;