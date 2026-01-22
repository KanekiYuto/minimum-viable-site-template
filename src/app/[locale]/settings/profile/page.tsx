"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserProfile } from "./_components/UserProfile";
import { ProfileSkeleton } from "./_components/ProfileSkeleton";
import { useSettingsNav } from "../_components/SettingsNavContext";
import { useUserStore } from "@/store/useUserStore";

export default function ProfilePage() {
  const t = useTranslations("settings.profile");
  const { openMenu } = useSettingsNav();
  const { user, isLoading: userLoading } = useUserStore();

  const loadingStartTimeRef = useRef<number | null>(
    userLoading ? Date.now() : null
  );
  const [isMinLoadingTimeElapsed, setIsMinLoadingTimeElapsed] = useState(
    !userLoading
  );

  useEffect(() => {
    if (userLoading) {
      loadingStartTimeRef.current = Date.now();
      setIsMinLoadingTimeElapsed(false);
      return;
    }

    const startedAt = loadingStartTimeRef.current;
    if (!startedAt) {
      setIsMinLoadingTimeElapsed(true);
      return;
    }

    const elapsedTime = Date.now() - startedAt;
    const remainingTime = Math.max(0, 300 - elapsedTime);
    const timeoutId = setTimeout(
      () => setIsMinLoadingTimeElapsed(true),
      remainingTime
    );
    return () => clearTimeout(timeoutId);
  }, [userLoading]);

  if (userLoading || !isMinLoadingTimeElapsed) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">{t("notSignedIn")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="lg:hidden flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar-hover border border-border text-foreground hover:bg-sidebar-active transition-colors"
              aria-label={t("openMenu")}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">
          {t("sections.settings")}
        </h2>
        <UserProfile user={user} />
      </div>
    </div>
  );
}
