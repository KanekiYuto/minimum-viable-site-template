"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useModalStore } from "@/store/useModalStore";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type SignedOutGuideProps = {
  className?: string;
  /**
   * Show a secondary "View pricing" link button.
   * Useful for paywall/billing-related pages.
   */
  showPricingLink?: boolean;
};

export function SignedOutGuide({
  className,
  showPricingLink = true,
}: SignedOutGuideProps) {
  const t = useTranslations("auth.signedOutGuide");
  const { openLoginModal } = useModalStore();

  return (
    <div
      className={cn("flex items-center justify-center min-h-[80vh]", className)}
    >
      <Empty className="w-full max-w-xl border border-border rounded-lg bg-sidebar-bg !bg-background-1">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="!bg-background-2 !p-6 border bordr-bg-background-3 bg-sidebar-hover text-muted-foreground"
          >
            <Lock className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle className="text-foreground">{t("title")}</EmptyTitle>
          <EmptyDescription className="max-w-md text-muted-foreground">
            {t("description")}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="w-full flex-row justify-center gap-3">
          <Button variant="gradient" onClick={openLoginModal}>
            {t("signIn")}
          </Button>
          {showPricingLink && (
            <Button asChild variant="secondary">
              <Link href="/pricing">{t("viewPricing")}</Link>
            </Button>
          )}
        </EmptyContent>
      </Empty>
    </div>
  );
}

