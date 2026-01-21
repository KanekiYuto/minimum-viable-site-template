import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { extensionsConfig } from "@config/extensions";

const { i18n } = extensionsConfig;

export const routing = defineRouting({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
  localePrefix: i18n.localePrefix,
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);