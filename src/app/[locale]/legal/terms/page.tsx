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
    title: t("legal.terms.title", { siteName: siteConfig.name }),
    description: t("legal.terms.description", { siteName: siteConfig.name }),
    alternates: generateAlternates(locale, "/legal/terms"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  const termsMarkdown = await loadLegalMarkdown("terms", {
    siteName: siteConfig.name,
    lastUpdated: siteConfig.legal.termsLastUpdated,
    email: siteConfig.contact.email,
  });

  return (
    <DocumentLayout
      content={termsMarkdown}
      showNav={true}
    />
  );
}
