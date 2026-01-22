import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { generateAlternates } from "@/lib/metadata";
import { loadLegalMarkdown } from "@/lib/legal-content";

const metadataInfo = {
  title: `${siteConfig.name} - Terms of Service`,
  description: `Read ${siteConfig.name}'s Terms of Service to understand the rules and conditions for using our AI platform`,
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
    alternates: generateAlternates(locale, "/legal/terms"),
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
