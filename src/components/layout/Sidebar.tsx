"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  Home,
  LayoutGrid,
  Image as ImageIcon,
  Clock,
  Settings,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useThemeStore } from "@/store/useThemeStore";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  href: string;
}

const navItemsConfig: Omit<NavItem, "labelKey">[] = [
  { icon: Home, href: "/home" },
  { icon: LayoutGrid, href: "/apps" },
  { icon: ImageIcon, href: "/assets" },
  { icon: Clock, href: "/history" },
];

const bottomItemsConfig: Omit<NavItem, "labelKey">[] = [
  { icon: Settings, href: "/settings/profile" },
  { icon: HelpCircle, href: "/help" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("sidebar");
  const { theme } = useThemeStore();

  const navItems: NavItem[] = [
    { ...navItemsConfig[0], labelKey: t("home") },
    { ...navItemsConfig[1], labelKey: t("apps") },
    { ...navItemsConfig[2], labelKey: t("assets") },
    { ...navItemsConfig[3], labelKey: t("history") },
  ];

  const bottomItems: NavItem[] = [
    { ...bottomItemsConfig[0], labelKey: t("settings") },
    { ...bottomItemsConfig[1], labelKey: t("help") },
  ];

  // 判断是否激活的辅助函数（处理国际化路由）
  const isActiveRoute = (href: string) => {
    // 移除当前 locale 前缀来比较路径
    const localePrefix = `/${locale}`;
    const pathWithoutLocale = pathname.startsWith(localePrefix)
      ? pathname.slice(localePrefix.length)
      : pathname;
    const normalizedPath = pathWithoutLocale || '/';

    if (href === '/') {
      return normalizedPath === '/';
    }

    return normalizedPath.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:w-16 flex-shrink-0 bg-background",
        className
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center justify-center">
        <div className="relative h-10 w-10 overflow-hidden rounded-lg">
          <Image
            src={theme === 'light' ? siteConfig.logo.light : siteConfig.logo.dark}
            alt={`${siteConfig.name} Logo`}
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
      </Link>

      {/* 主导航 */}
      <nav className="flex flex-1 flex-col py-4">
        <div className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center gap-1"
              >
                <motion.div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors relative",
                    isActive
                      ? "bg-background-2 text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:rounded-r before:bg-primary"
                      : "text-muted-foreground hover:bg-background-2 hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] transition-colors",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>{item.labelKey}</span>
              </Link>
            );
          })}
        </div>

        {/* 底部导航 */}
        <div className="mt-auto flex flex-col gap-1 px-2 pt-4">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center gap-1"
              >
                <motion.div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors relative",
                    isActive
                      ? "bg-background-2 text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:rounded-r before:bg-primary"
                      : "text-muted-foreground hover:bg-background-2 hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] transition-colors",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>{item.labelKey}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
