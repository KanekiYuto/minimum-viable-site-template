"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/routing";

interface ManageSubscriptionButtonProps {
  customerId: string;
}

export function ManageSubscriptionButton({
  customerId,
}: ManageSubscriptionButtonProps) {
  const t = useTranslations("settings.billing");

  const href = `/portal?customerId=${encodeURIComponent(customerId)}`;

  return (
    <Link
      href={href}
      prefetch={false}
      className="px-4 py-2 bg-background-2 hover:bg-background-3 border border-background-4 text-foreground text-sm font-medium rounded-xl transition-colors cursor-pointer inline-flex"
    >
      {t("manageSubscription")}
    </Link>
  );
}
