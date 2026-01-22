"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, CreditCard, X, Gem, BarChart3 } from "lucide-react";
import { SettingsNavProvider } from "./SettingsNavContext";
import { useTranslations } from "next-intl";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function SettingsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("settings.layout");

  const navSectionsUi: NavSection[] = [
    {
      title: t("nav.myInfo"),
      items: [{ label: t("nav.profile"), href: "./profile", icon: User }],
    },
    {
      title: t("nav.credits"),
      items: [
        { label: t("nav.creditsBalance"), href: "./credits", icon: Gem },
        { label: t("nav.usage"), href: "./usage", icon: BarChart3 },
      ],
    },
    {
      title: t("nav.billing"),
      items: [
        { label: t("nav.subscriptionPlan"), href: "./billing", icon: CreditCard },
      ],
    },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <SettingsNavProvider
      value={{
        isMenuOpen: mobileMenuOpen,
        openMenu: () => setMobileMenuOpen(true),
        closeMenu: closeMobileMenu,
      }}
    >
      <div className="flex min-h-screen text-foreground">
        {/* 移动端遮罩 */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/60 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* 侧边栏 */}
        <aside
          className={cn(
            "fixed left-0 top-16 bottom-0 z-50 w-[min(20rem,85vw)] bg-background border-t border-dashed border-background-2 transition-transform lg:static lg:translate-x-0 lg:w-64 lg:border-t-0",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            {/* 移动端关闭按钮 */}
            <div className="flex items-center justify-between mb-5 lg:hidden">
              <div className="text-sm font-medium text-muted">{t("title")}</div>
              <button
                onClick={closeMobileMenu}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-foreground hover:bg-background-2 transition-colors"
                aria-label={t("closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden lg:block text-sm font-medium text-muted mb-6">
              {t("title")}
            </div>

            <nav className="space-y-6">
              {navSectionsUi.map((section) => (
                <div key={section.title}>
                  <div className="text-xs text-muted/80 mb-2 uppercase tracking-wider">
                    {section.title}
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const hrefPath = item.href.replace("./", "");
                      const isActive =
                        pathname.endsWith(`/${hrefPath}`) ||
                        pathname.includes(`/${hrefPath}/`);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                              isActive
                                ? "bg-background-2 text-foreground font-medium"
                                : "text-muted hover:bg-background-2 hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 py-4">{children}</div>
        </main>
      </div>
    </SettingsNavProvider>
  );
}
