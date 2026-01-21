"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";

/**
 * 语言切换触发按钮
 */
export function LanguageSwitcher() {
  const t = useTranslations("layout");
  const { openLanguageModal } = useLanguageStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openLanguageModal}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
      aria-label={t("switchLanguage")}
    >
      <Languages className="h-5 w-5" />
    </motion.button>
  );
}
