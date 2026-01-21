/**
 * 将每个语言目录下的所有 JSON 文件合并成一个单独的 JSON 文件
 * 这样可以简化动态导入，避免 Next.js 16 Turbopack 的问题
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { extensionsConfig } from "@config/extensions";

function mergeLocaleMessages(locale: string) {
  const messagesRoot = join(process.cwd(), "messages");
  const localeDir = join(messagesRoot, locale);
  const messages: Record<string, unknown> = {};

  if (!existsSync(localeDir)) {
    mkdirSync(localeDir, { recursive: true });
  }

  const files = existsSync(localeDir)
    ? readdirSync(localeDir).filter((file) => file.endsWith(".json"))
    : [];

  files.forEach((file) => {
    const filePath = join(localeDir, file);
    const fileName = file.replace(".json", "");
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    messages[fileName] = data;
  });

  if (!existsSync(messagesRoot)) {
    mkdirSync(messagesRoot, { recursive: true });
  }

  const outputPath = join(messagesRoot, `${locale}.json`);
  writeFileSync(outputPath, JSON.stringify(messages, null, 2), "utf-8");
  console.log(`✓ 已合并 ${locale} 的翻译文件 (${files.length} 个文件)`);
}

console.log("开始合并翻译文件...\n");
extensionsConfig.i18n.locales.forEach((locale) => mergeLocaleMessages(locale));
console.log("\n所有翻译文件合并完成！");
