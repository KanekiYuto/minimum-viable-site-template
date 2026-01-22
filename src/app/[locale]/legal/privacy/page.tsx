import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { generateAlternates } from "@/lib/metadata";
import { loadLegalMarkdown } from "@/lib/legal-content";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("legal.privacy.title", { siteName: siteConfig.name }),
    description: t("legal.privacy.description", { siteName: siteConfig.name }),
    alternates: generateAlternates(locale, "/legal/privacy"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  const privacyMarkdown = await loadLegalMarkdown("privacy", {
    siteName: siteConfig.name,
    lastUpdated: siteConfig.legal.privacyLastUpdated,
    email: siteConfig.contact.email,
  });

  return (
    <DocumentLayout
      content={privacyMarkdown}
      showNav={true}
    />
  );
}
