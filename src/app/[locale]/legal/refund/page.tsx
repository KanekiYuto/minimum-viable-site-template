import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { generateAlternates } from "@/lib/metadata";
import { loadLegalMarkdown } from "@/lib/legal-content";

const metadataInfo = {
  title: `${siteConfig.name} - Refund Policy`,
  description: `Learn about ${siteConfig.name}'s refund policy, including subscription refunds, credit refunds, and application process`,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    title: metadataInfo.title,
    description: metadataInfo.description,
    alternates: generateAlternates(locale, "/legal/refund"),
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
