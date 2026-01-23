"use client";

import { Pricing } from "@/components/pricing";
import { PaymentIcons } from "@/components/pricing/PaymentIcons";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function PricingPageClient() {
  const t = useTranslations("pricing");

  return (
    <div className="min-h-screen">
      <div className="py-16 px-4 md:px-6 lg:px-8 ">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("header.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("header.description")}
          </p>
        </motion.div>
        
        <Pricing />
      </div>

      {/* 支付方式图标 */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <PaymentIcons />
        </div>
      </div>

      {/* FAQ 部分 */}
      <PricingFAQ />
    </div>
  );
}
