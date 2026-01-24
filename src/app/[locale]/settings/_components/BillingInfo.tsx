"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/store/useUserStore";
import { getPlanInfo } from "@/app/_lib/plan";
import { ManageSubscriptionButton } from "@/components/subscription/ManageSubscriptionButton";
import { Badge } from "@/components/ui/badge";

interface SubscriptionData {
  planType: string;
  customerId: string;
  amount: string;
  platform: string;
  startDate: string;
  expiryDate: string;
  renewalDate: string;
}

export function BillingInfo() {
  const t = useTranslations("settings.billing");
  const tPlans = useTranslations("common.plans");
  const { user } = useUserStore();
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!user) return null;

  const planName = subscriptionData
    ? tPlans(subscriptionData.planType)
    : getPlanInfo(user.type, (key) => tPlans(key)).name;

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/subscription/list");
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const subscription = result.data[0];

          const amount = subscription.amount / 100;
          const currency = subscription.currency;

          const formatDate = (dateStr: string) => {
            if (!dateStr) return "-";
            return new Date(dateStr).toLocaleDateString();
          };

          setSubscriptionData({
            planType: subscription.planType,
            customerId: subscription.paymentCustomerId,
            amount: `${currency} ${amount.toFixed(2)}`,
            platform: subscription.paymentPlatform,
            startDate: formatDate(subscription.startedAt),
            expiryDate: formatDate(subscription.expiresAt),
            renewalDate: formatDate(subscription.nextBillingAt),
          });
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  return (
    <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          {planName}
        </h3>
        <Badge variant="success" className="text-sm px-3 py-1">
          {t("active")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            {t("billingAmount")}
          </div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.amount || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            {t("paymentPlatform")}
          </div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.platform || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            {t("startDate")}
          </div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.startDate || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            {t("expiryDate")}
          </div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.expiryDate || "-"}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            {t("renewalDate")}
          </div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.renewalDate || "-"}
          </div>
        </div>
        {subscriptionData?.customerId && (
          <ManageSubscriptionButton customerId={subscriptionData.customerId} />
        )}
      </div>
    </div>
  );
}
