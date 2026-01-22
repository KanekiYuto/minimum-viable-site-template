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
    title: t("legal.refund.title", { siteName: siteConfig.name }),
    description: t("legal.refund.description", { siteName: siteConfig.name }),
    alternates: generateAlternates(locale, "/legal/refund"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RefundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  const refundMarkdown = await loadLegalMarkdown("refund", {
    siteName: siteConfig.name,
    lastUpdated: siteConfig.legal.termsLastUpdated,
    email: siteConfig.contact.email,
  });

  return (
    <DocumentLayout
      content={refundMarkdown}
      showNav={true}
    />
  );
}
