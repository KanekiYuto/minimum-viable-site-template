"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSettingsNav } from "../_components/SettingsNavContext";
import { useUserStore } from "@/store/useUserStore";
import { useCreditStore } from "@/store/useCreditStore";
import { getPlanInfo } from "@/app/_lib/plan";
import { CreditsSkeleton } from "./_components/CreditsSkeleton";
import { CreditsHeader } from "./_components/CreditsHeader";
import { CreditsOverview } from "./_components/CreditsOverview";
import { CreditsFilter } from "./_components/CreditsFilter";
import { CreditsList } from "./_components/CreditsList";

export default function CreditsPage() {
  const t = useTranslations("settings.credits");
  const tPlans = useTranslations("common.plans");
  const { openMenu } = useSettingsNav();
  const { user, isLoading: userLoading } = useUserStore();
  const { credits, summary, state: creditState } = useCreditStore();
  const isLoading = creditState === "loading" || creditState === "idle";
  const [filter, setFilter] = useState<"all" | "active" | "expired">("active");

  const planInfo = user ? getPlanInfo(user.type, (key) => tPlans(key)) : null;
  const filteredCredits = credits.filter((credit) => {
    if (filter === "all") return true;
    const isExpired =
      credit.expiresAt && new Date(credit.expiresAt).getTime() < Date.now();
    if (filter === "active") return !isExpired;
    if (filter === "expired") return isExpired;
    return true;
  });

  if (userLoading) {
    return <CreditsSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Not signed in</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <CreditsHeader
        title={t("title")}
        description={t("description")}
        openMenuLabel={t("openMenu")}
        onOpenMenu={openMenu}
      />

      {!isLoading && (
        <CreditsOverview
          summary={summary}
          planInfo={planInfo}
          currentBalanceLabel={t("overview.currentBalance")}
          availableCreditsLabel={t("overview.availableCredits")}
          currentPlanLabel={t("overview.currentPlan")}
          consumedLabel={t("overview.totalConsumed")}
          creditsUsedLabel={t("overview.creditsUsed")}
        />
      )}

      {!isLoading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">
              {t("details.title")}
            </h2>

            <CreditsFilter
              filter={filter}
              onChange={setFilter}
              allLabel={t("details.filter.all")}
              activeLabel={t("details.filter.active")}
              expiredLabel={t("details.filter.expired")}
            />
          </div>

          <CreditsList
            credits={credits}
            filteredCredits={filteredCredits}
            noCreditsLabel={t("details.noCredits")}
            noMatchingLabel={t("details.noMatchingCredits")}
            consumedLabel={t("details.consumed")}
            remainingLabel={t("details.remaining")}
            statusActiveLabel={t("details.active")}
            statusExpiringLabel={t("details.expiringSoon")}
            statusExpiredLabel={t("details.expired")}
            typeLabel={(type) => t(`details.types.${type}`)}
          />
        </div>
      )}
    </div>
  );
}
