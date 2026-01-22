"use client";

import { Calendar, Gem, TrendingUp } from "lucide-react";

interface Summary {
  totalRemaining: number;
  totalConsumed: number;
}

interface PlanInfo {
  name: string;
  colorClass: string;
}

interface CreditsOverviewProps {
  summary: Summary | null;
  planInfo: PlanInfo | null;
  currentBalanceLabel: string;
  availableCreditsLabel: string;
  currentPlanLabel: string;
  consumedLabel: string;
  creditsUsedLabel: string;
}

export function CreditsOverview({
  summary,
  planInfo,
  currentBalanceLabel,
  availableCreditsLabel,
  currentPlanLabel,
  consumedLabel,
  creditsUsedLabel,
}: CreditsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-background-1 border border-background-2 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Gem className="h-4 w-4" />
            <span>{currentBalanceLabel}</span>
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground">
          {summary?.totalRemaining || 0}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {availableCreditsLabel}
        </div>
      </div>

      <div className="bg-background-1 border border-background-2 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <TrendingUp className="h-4 w-4" />
            <span>{currentPlanLabel}</span>
          </div>
        </div>
        {planInfo && (
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${planInfo.colorClass}`}>
              {planInfo.name}
            </span>
          </div>
        )}
      </div>

      <div className="bg-background-1 border border-background-2 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar className="h-4 w-4" />
            <span>{consumedLabel}</span>
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground">
          {summary?.totalConsumed || 0}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {creditsUsedLabel}
        </div>
      </div>
    </div>
  );
}
