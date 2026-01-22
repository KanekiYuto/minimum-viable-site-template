"use client";

import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";

interface ManageSubscriptionButtonProps {
  customerId: string;
}

export function ManageSubscriptionButton({
  customerId: _customerId,
}: ManageSubscriptionButtonProps) {
  const t = useTranslations("settings.billing");
  const supportEmail = siteConfig.contact?.email;
  const href = supportEmail ? `mailto:${supportEmail}` : "/help";

  return (
    <a
      href={href}
      className="px-4 py-2 bg-background-2 hover:bg-background-3 border border-background-4 text-foreground text-sm font-medium rounded-xl transition-colors cursor-pointer"
    >
      {t("manageSubscription")}
    </a>
  );
}
