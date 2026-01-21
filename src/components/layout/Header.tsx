"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Menu, X, Moon, Sun } from "lucide-react";
import { UserButton } from "@/components/auth/UserButton";
import { useUserStore } from "@/store/useUserStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useModalStore } from "@/store/useModalStore";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({ className, onMenuClick, isMobileMenuOpen }: HeaderProps) {
  const t = useTranslations("header");
  const { user, isLoading } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const { openLoginModal } = useModalStore();

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

            {/* 主题切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label={t("toggleTheme")}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.button>

            {/* 语言切换按钮 */}
            <LanguageSwitcher />

            {/* 用户按钮或登录按钮 */}
            <div className="ml-2">
              {isLoading ? (
                // 加载骨架屏
                <div className="h-10 w-10 rounded-full bg-secondary animate-pulse ring-2 ring-border" />
              ) : user ? (
                // 已登录显示用户按钮
                <UserButton />
              ) : (
                // 未登录显示登录按钮
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openLoginModal}
                  className="flex h-10 px-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white font-medium text-sm cursor-pointer"
                >
                  {t("signIn")}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
