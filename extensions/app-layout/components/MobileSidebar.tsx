"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import type { NavItem } from "./Sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  bottomItems: NavItem[];
}

export function MobileSidebar({
  isOpen,
  onClose,
  navItems,
  bottomItems,
}: MobileSidebarProps) {
  const { user } = useUserStore();

  // 禁止背景滚动
  useEffect(() => {
    const mainElement = document.querySelector('main');

    if (!mainElement) return;

    if (isOpen) {
      // 禁止主内容区域滚动
      mainElement.style.overflow = 'hidden';
    } else {
      // 恢复滚动
      mainElement.style.overflow = 'auto';
    }

    return () => {
      // 清理 - 恢复滚动
      const main = document.querySelector('main');
      if (main) {
        (main as HTMLElement).style.overflow = 'auto';
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 侧边栏面板 */}
          <motion.div
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            exit={{ x: "-100vw" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed inset-y-0 left-0 z-[1000] w-full flex flex-col bg-background lg:hidden"
          >
            {/* 顶部栏 - 关闭按钮 */}
            <div className="flex items-center justify-end px-4 py-3">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-background-1 border border-background-2"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* 用户信息卡片 */}
            {user && (
              <div className="mx-4 mb-6 rounded-lg border border-border bg-background-1 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-hover ring-2 ring-border">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 菜单列表 */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar">
              {/* 主导航 */}
              <div className="flex flex-col gap-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center justify-between rounded-lg py-2 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* 底部按钮组 */}
            <div className="border-border/50 bg-background px-5 pb-2">
              <div className="flex justify-start gap-2">
                {bottomItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (navItems.length + index) * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex flex-col items-center gap-1 p-2"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-foreground text-center">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
