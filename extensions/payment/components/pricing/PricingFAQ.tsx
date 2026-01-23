"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

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
        className="w-full flex items-center justify-between py-4 sm:py-6 text-left group"
      >
        <span className="text-sm sm:text-base lg:text-lg text-foreground font-medium pr-3 sm:pr-8 group-hover:text-primary transition-colors">
          {item.question}
        </span>
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary transition-colors">
          {isOpen ? (
            <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
          ) : (
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
          )}
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

interface PricingFAQProps {
  title: string;
  items: FAQItem[];
  defaultOpenIndex?: number | null;
}

export function PricingFAQ({
  title,
  items,
  defaultOpenIndex = 2,
}: PricingFAQProps) {
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
