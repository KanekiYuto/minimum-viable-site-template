import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { generateAlternates } from "@/lib/metadata";
import { loadLegalMarkdown } from "@/lib/legal-content";

const metadataInfo = {
  title: `${siteConfig.name} - Privacy Policy`,
  description: `Learn how ${siteConfig.name} collects, uses, and protects your personal information`,
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
    alternates: generateAlternates(locale, "/legal/privacy"),
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
