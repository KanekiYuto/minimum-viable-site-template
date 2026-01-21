"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
  rightActions: ReactNode;
}

export function Header({
  className,
  onMenuClick,
  isMobileMenuOpen,
  rightActions,
}: HeaderProps) {
  const t = useTranslations("header");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-header-bg h-16 flex-shrink-0",
          className
        )}
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* 左侧：移动端菜单按钮 */}
          <div className="flex items-center gap-3 lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>

          {/* Right: Actions */}
          <div className="ml-auto flex items-center gap-2">
            {rightActions}
          </div>
        </div>
      </header>
    </>
  );
}
