"use client";

import { Menu } from "lucide-react";

interface CreditsHeaderProps {
  title: string;
  description: string;
  openMenuLabel: string;
  onOpenMenu: () => void;
}

export function CreditsHeader({
  title,
  description,
  openMenuLabel,
  onOpenMenu,
}: CreditsHeaderProps) {
  return (
    <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="lg:hidden flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar-hover border border-border text-foreground hover:bg-sidebar-active transition-colors"
            aria-label={openMenuLabel}
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
            {title}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>
    </div>
  );
}
