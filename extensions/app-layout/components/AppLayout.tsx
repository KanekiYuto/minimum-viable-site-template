"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar, type NavItem } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Footer, type FooterSection, type SocialLink } from "./Footer";
import { MainContent } from "./MainContent";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  header: {
    rightActions: ReactNode;
  };
  sidebar: {
    brandName: string;
    logo: {
      light: string;
      dark: string;
    };
    navItems: NavItem[];
    bottomItems: NavItem[];
  };
  mobileSidebar: {
    navItems: NavItem[];
    bottomItems: NavItem[];
  };
  footer: {
    brandName: string;
    fullName: string;
    copyright: {
      year: number;
      text: string;
    };
    sections: FooterSection[];
    socialLinks: SocialLink[];
  };
}

export function AppLayout({
  children,
  className,
  header,
  sidebar,
  mobileSidebar,
  footer,
}: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className={cn("flex flex-col h-screen bg-background lg:flex-row overflow-hidden", className)}>
      {/* 桌面端侧边栏 - 正常 flex 布局 */}
      <Sidebar
        brandName={sidebar.brandName}
        logo={sidebar.logo}
        navItems={sidebar.navItems}
        bottomItems={sidebar.bottomItems}
      />

      {/* 移动端侧边栏 */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        navItems={mobileSidebar.navItems}
        bottomItems={mobileSidebar.bottomItems}
      />

      {/* 右侧内容区域 - 占据剩余空间 */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header - sticky 定位 */}
        <Header
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileMenuOpen={isMobileSidebarOpen}
          rightActions={header.rightActions}
        />

        {/* Main 内容区域 - 可滚动 */}
        <main className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <MainContent>{children}</MainContent>
          <Footer
            brandName={footer.brandName}
            fullName={footer.fullName}
            copyright={footer.copyright}
            sections={footer.sections}
            socialLinks={footer.socialLinks}
          />
        </main>
      </div>
    </div>
  );
}
