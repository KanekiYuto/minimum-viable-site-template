"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * FAQ 条目（由外部注入；此目录不做国际化/文案拼装）。
 */
export interface FAQItem {
  question: string;
  answer: string;
}

function FAQItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 sm:py-6 text-left group cursor-pointer"
      >
        <span className="text-sm sm:text-base lg:text-lg text-foreground font-medium pr-3 sm:pr-8 group-hover:text-primary transition-colors">
          {item.question}
        </span>
        <div className="flex-shrink-0 bg-background-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary transition-colors">
          <ChevronDown
            className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 sm:pb-6 pr-6 sm:pr-12">
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FAQProps {
  /** 标题 */
  title: string;
  /** FAQ 列表 */
  items: FAQItem[];
  /** 默认展开项索引；传 null 表示默认全折叠 */
  defaultOpenIndex?: number | null;
}

/**
 * FAQ 区域（折叠面板）。
 */
export function FAQ({ title, items, defaultOpenIndex = 2 }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-4 mb-2 lg:mb-0"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground leading-tight">
              {title}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <div className="space-y-0">
              {items.map((faq, index) => (
                <FAQItemComponent
                  key={index}
                  item={faq}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
