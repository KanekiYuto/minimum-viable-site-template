"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * 定价页面标题组件
 */
export function PricingHeader() {
  const t = useTranslations("pricing");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {t("header.title")}
      </h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        {t("header.description")}
      </p>
    </motion.div>
  );
}
