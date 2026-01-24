"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useThemeStore } from "@extensions/theme/store/useThemeStore";
import type { ComponentType } from "react";

export type NavItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

interface SidebarProps {
  className?: string;
  brandName: string;
  logo: {
    light: string;
    dark: string;
  };
  navItems: NavItem[];
  bottomItems: NavItem[];
}

export function Sidebar({
  className,
  brandName,
  logo,
  navItems,
  bottomItems,
}: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const { theme } = useThemeStore();

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
            src={theme === "light" ? logo.light : logo.dark}
            alt={`${brandName} Logo`}
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
                )}>{item.label}</span>
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
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
