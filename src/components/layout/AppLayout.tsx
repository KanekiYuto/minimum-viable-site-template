"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Footer } from "./Footer";
import { MainContent } from "./MainContent";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({
  children,
  className,
}: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className={cn("flex flex-col h-screen bg-background lg:flex-row overflow-hidden", className)}>
      {/* 桌面端侧边栏 - 正常 flex 布局 */}
      <Sidebar />

      {/* 移动端侧边栏 */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 右侧内容区域 - 占据剩余空间 */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header - sticky 定位 */}
        <Header
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileMenuOpen={isMobileSidebarOpen}
        />

        {/* Main 内容区域 - 可滚动 */}
        <main className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <MainContent>{children}</MainContent>
          <Footer />
        </main>
      </div>
    </div>
  );
}
