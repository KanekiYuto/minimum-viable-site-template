/**
 * 定价FAQ数据
 * 该文件已被重构为使用国际化
 * FAQ 文本现在从 messages/[locale]/pricing.json 中的 faq.items 读取
 */
export interface FAQItem {
  question: string;
  answer: string;
}
