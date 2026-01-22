"use client";

import { Clock } from "lucide-react";

interface CreditItem {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  remaining: number;
  issuedAt: string;
  expiresAt: string | null;
}

interface CreditsListProps {
  credits: CreditItem[];
  filteredCredits: CreditItem[];
  noCreditsLabel: string;
  noMatchingLabel: string;
  consumedLabel: string;
  remainingLabel: string;
  statusActiveLabel: string;
  statusExpiringLabel: string;
  statusExpiredLabel: string;
  typeLabel: (type: string) => string;
}

export function CreditsList({
  credits,
  filteredCredits,
  noCreditsLabel,
  noMatchingLabel,
  consumedLabel,
  remainingLabel,
  statusActiveLabel,
  statusExpiringLabel,
  statusExpiredLabel,
  typeLabel,
}: CreditsListProps) {
  if (filteredCredits.length === 0) {
    return (
      <div className="bg-background-1 border border-background-2 rounded-2xl p-6 text-center text-muted-foreground">
        {credits.length === 0 ? noCreditsLabel : noMatchingLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredCredits.map((credit) => {
        const percentage =
          credit.amount > 0 ? (credit.remaining / credit.amount) * 100 : 0;
        const usageRate = 100 - percentage;
        const expiresTime = credit.expiresAt
          ? new Date(credit.expiresAt).getTime()
          : null;
        const isExpiringSoon =
          expiresTime &&
          expiresTime > Date.now() &&
          expiresTime - Date.now() < 7 * 24 * 60 * 60 * 1000;
        const isExpired = expiresTime && expiresTime <= Date.now();

        let progressColor = "";
        if (usageRate < 50) {
          progressColor = "bg-green-600 dark:bg-green-500";
        } else if (usageRate < 80) {
          progressColor = "bg-yellow-600 dark:bg-yellow-500";
        } else {
          progressColor = "bg-red-600 dark:bg-red-500";
        }

        return (
          <div
            key={credit.id}
            className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">
                {typeLabel(credit.type)}
              </h3>
              <span
                className={`px-3 py-1 text-xs font-medium rounded ${
                  isExpired
                    ? "bg-red-950/80 text-red-400"
                    : isExpiringSoon
                    ? "bg-yellow-950/80 text-yellow-400"
                    : "bg-green-950/80 text-green-400"
                }`}
              >
                {isExpired
                  ? statusExpiredLabel
                  : isExpiringSoon
                  ? statusExpiringLabel
                  : statusActiveLabel}
              </span>
            </div>

            {credit.expiresAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 bg-background-2 hover:bg-background-3/50 border border-background-4/50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(credit.issuedAt).toLocaleDateString()} &rarr;{" "}
                  {new Date(credit.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  {credit.remaining.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">
                  / {credit.amount.toLocaleString()}
                </span>
                <span className="ml-auto text-base font-medium text-muted">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="mb-5">
              <div className="h-3 bg-background-2 hover:bg-background-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-2 hover:bg-background-3/50 rounded-xl p-3 border border-background-4/50">
                <div className="text-xs text-muted-foreground mb-1">
                  {consumedLabel}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {credit.consumed.toLocaleString()}
                </div>
              </div>
              <div className="bg-background-2 hover:bg-background-3/50 rounded-xl p-3 border border-background-4/50">
                <div className="text-xs text-muted-foreground mb-1">
                  {remainingLabel}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {credit.remaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
