import { extensionsConfig } from "@config/extensions";

export const siteConfig = {
  name: "Site",
  fullName: "Site",
  logo: {
    light: "/logo.png",
    dark: "/logo.png",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL,
  locales: extensionsConfig.i18n.locales,
  contact: {
    email: "support@example.com",
  },
  legal: {
    termsLastUpdated: "2025-01-01",
    privacyLastUpdated: "2025-01-01",
  },
  social: {
    discord: "#",
  },
  links: {
    legal: [],
  },
  copyright: {
    year: new Date().getFullYear(),
    text: "All rights reserved.",
  },
};
