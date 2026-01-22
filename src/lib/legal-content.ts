import { readFile } from "fs/promises";
import { join } from "path";

type LegalMarkdownParams = {
  siteName: string;
  lastUpdated: string;
  email: string;
};

function applyTemplate(text: string, params: LegalMarkdownParams) {
  return text
    .replace(/{siteName}/g, params.siteName)
    .replace(/{lastUpdated}/g, params.lastUpdated)
    .replace(/{email}/g, params.email);
}

export async function loadLegalMarkdown(
  slug: "privacy" | "terms" | "refund",
  params: LegalMarkdownParams
) {
  const filePath = join(process.cwd(), "src", "content", "legal", `${slug}.md`);
  const content = await readFile(filePath, "utf-8");
  return applyTemplate(content, params);
}
