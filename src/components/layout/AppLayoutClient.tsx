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

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <title>Discord</title>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

type AppLayoutClientProps = {
  children: ReactNode;
};

export function AppLayoutClient({ children }: AppLayoutClientProps) {
  const tSidebar = useTranslations("app-layout");
  const tSections = useTranslations("footer.sections");
  const { theme, toggleTheme } = useThemeStore();
  const tHeader = useTranslations("header");
  const { user, isLoading } = useUserStore();
  const { openLoginModal } = useModalStore();

  const sidebarNavItems = [
    { icon: Home, href: "/home", label: tSidebar("sidebar.home") },
    { icon: Clock, href: "/history", label: tSidebar("sidebar.history") },
  ];
  const sidebarBottomItems = [
    { icon: Settings, href: "/settings/profile", label: tSidebar("sidebar.settings") },
    { icon: HelpCircle, href: "/help", label: tSidebar("sidebar.help") },
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
              aria-label={tHeader("toggleTheme")}
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openLoginModal}
                  className="flex h-10 px-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white font-medium text-sm cursor-pointer"
                >
                  {tHeader("signIn")}
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
          { title: tSections("models"), links: siteConfig.links.models },
        ],
        socialLinks: [
          {
            icon: DiscordIcon,
            href: siteConfig.social.discord,
            label: "Discord",
          },
        ],
      }}
    >
      {children}
    </AppLayout>
  );
}
