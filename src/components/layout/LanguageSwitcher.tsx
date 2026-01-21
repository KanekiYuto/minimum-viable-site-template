"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Languages, Check } from "lucide-react";
import { locales, localeNames } from "@i18n/config";
import { usePathname, useRouter } from "@i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 语言切换触发按钮
 */
export function LanguageSwitcher() {
  const t = useTranslations("layout");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelectLocale = (nextLocale: string) => {
    if (nextLocale === locale) return;
    router.push(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          aria-label={t("switchLanguage")}
        >
          <Languages className="h-5 w-5" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {locales.map((item) => {
          const label = localeNames[item as keyof typeof localeNames] ?? item;
          const isActive = item === locale;
          return (
            <DropdownMenuItem
              key={item}
              onSelect={() => handleSelectLocale(item)}
              className="flex items-center justify-between"
            >
              <span>{label}</span>
              {isActive ? <Check className="h-4 w-4 text-foreground" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
