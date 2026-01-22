"use client";

import { AppLayout } from "@extensions/app-layout/components/AppLayout";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Home,
  Clock,
  Settings,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { useThemeStore } from "@extensions/theme/store/useThemeStore";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserButton } from "@/components/auth/UserButton";
import { useUserStore } from "@/store/useUserStore";
import { useModalStore } from "@/store/useModalStore";

type AppLayoutClientProps = {
  children: ReactNode;
};

export function AppLayoutClient({ children }: AppLayoutClientProps) {
  const tAppLayout = useTranslations("app-layout");
  const { theme, toggleTheme } = useThemeStore();
  const { user, isLoading } = useUserStore();
  const { openLoginModal } = useModalStore();

  const sidebarNavItems = [
    { icon: Home, href: "/home", label: tAppLayout("sidebar.home") },
    { icon: Clock, href: "/history", label: tAppLayout("sidebar.history") },
  ];
  const sidebarBottomItems = [
    { icon: Settings, href: "/settings/profile", label: tAppLayout("sidebar.settings") },
    { icon: HelpCircle, href: "/help", label: tAppLayout("sidebar.help") },
  ];

  return (
    <AppLayout
      header={{
        rightActions: (
          <>
            {/* 主题切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label={tAppLayout("toggleTheme")}
            >
              {theme === "light" ? (
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
                <div className="h-10 w-10 rounded-full bg-secondary animate-pulse ring-2 ring-border" />
              ) : user ? (
                <UserButton />
              ) : (
                <motion.button
                  onClick={openLoginModal}
                  className="flex h-10 px-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white font-medium text-sm cursor-pointer"
                >
                  {tAppLayout("signIn")}
                </motion.button>
              )}
            </div>
          </>
        ),
      }}
      sidebar={{
        brandName: siteConfig.name,
        logo: siteConfig.logo,
        navItems: sidebarNavItems,
        bottomItems: sidebarBottomItems,
      }}
      mobileSidebar={{
        navItems: [...sidebarNavItems, ...sidebarBottomItems.slice(0, 1)],
        bottomItems: sidebarBottomItems.slice(1),
      }}
      footer={{
        brandName: siteConfig.name,
        fullName: siteConfig.fullName,
        copyright: siteConfig.copyright,
        sections: [
          {
            title: tAppLayout("footer.sections.legal"), links: [
              { label: tAppLayout("footer.links.privacy"), href: "/legal/privacy" },
              { label: tAppLayout("footer.links.terms"), href: "/legal/terms" },
              { label: tAppLayout("footer.links.refund"), href: "/legal/refund" },
            ]
          },
        ],
        socialLinks: [],
      }}
    >
      {children}
    </AppLayout>
  );
}
