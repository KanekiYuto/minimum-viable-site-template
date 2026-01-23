"use client";

import { motion } from "framer-motion";

/**
 * 定价页面标题组件
 */
export interface PricingHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function PricingHeader({
  title,
  description,
  className = "text-center mb-12",
}: PricingHeaderProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={className}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {title}
      </h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        {description}
      </p>
    </motion.div>
  );
}
