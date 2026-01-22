"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { oneTap } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";
import { useUserStore } from "@/store/useUserStore";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useUserStore();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !isAuthenticated &&
      !isLoading &&
      process.env.NODE_ENV === "production"
    ) {
      const initializeOneTap = async () => {
        try {
          const callbackURL =
            pathname === "/"
              ? siteConfig.auth.defaultRedirectAfterLogin
              : pathname;
          await oneTap({ callbackURL });
        } catch (error) {
          console.error("One Tap initialization failed:", error);
        }
      };

      const timer = setTimeout(initializeOneTap, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, pathname]);

  return <>{children}</>;
}
