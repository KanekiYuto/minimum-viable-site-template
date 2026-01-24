import { getCreditPackById, getSubscriptionBySku } from "@/shared/payment/catalog/catalog";
import type { CreditPackDefinition, SubscriptionDefinition } from "@/shared/payment/types";
import type { CheckoutType } from "@/shared/payment/checkout";
import { creemProducts } from "./products/creem";

type ProductIds = { current?: string; historical?: readonly string[] };

type ResolveResult = { type: CheckoutType; sku: string };

const buildProductIdList = (ids?: ProductIds): string[] => {
  const historical = ids?.historical ? [...ids.historical] : [];
  const current = ids?.current ?? "";
  return [...historical, current].filter(Boolean);
};

const SUBSCRIPTION_PRODUCT_IDS_BY_SKU: Record<string, string[]> = Object.fromEntries(
  Object.entries(creemProducts.subscriptions).map(([sku, entry]) => [sku, buildProductIdList(entry.ids)]),
);

const CREDIT_PACK_PRODUCT_IDS_BY_SKU: Record<string, string[]> = Object.fromEntries(
  creemProducts.creditPacks.map((pack) => [pack.id, buildProductIdList(pack.ids)]),
);

const PRODUCT_ID_TO_SKU: Record<string, ResolveResult> = (() => {
  const mapping: Record<string, ResolveResult> = {};

  Object.entries(SUBSCRIPTION_PRODUCT_IDS_BY_SKU).forEach(([sku, productIds]) => {
    productIds.forEach((productId) => {
      mapping[productId] = { type: "sub", sku };
    });
  });

  Object.entries(CREDIT_PACK_PRODUCT_IDS_BY_SKU).forEach(([sku, productIds]) => {
    productIds.forEach((productId) => {
      mapping[productId] = { type: "one-time", sku };
    });
  });

  return mapping;
})();

export function resolveCreemProductId(type: CheckoutType, sku: string): string {
  const ids =
    type === "sub" ? SUBSCRIPTION_PRODUCT_IDS_BY_SKU[sku] : CREDIT_PACK_PRODUCT_IDS_BY_SKU[sku];

  const latest = ids?.at(-1);
  if (!latest) {
    throw new Error(`Creem product is not configured for sku "${sku}" (${type}).`);
  }
  return latest;
}

export function resolveSkuByCreemProductId(productId: string): ResolveResult | null {
  return PRODUCT_ID_TO_SKU[productId] || null;
}

export function getSubscriptionByCreemProductId(
  productId: string,
): (SubscriptionDefinition & { subscriptionSku: string }) | null {
  const resolved = resolveSkuByCreemProductId(productId);
  if (!resolved || resolved.type !== "sub") return null;

  const subscription = getSubscriptionBySku(resolved.sku);
  if (!subscription) return null;

  return { ...subscription, subscriptionSku: resolved.sku };
}

export function getCreditPackByCreemProductId(productId: string): CreditPackDefinition | null {
  const resolved = resolveSkuByCreemProductId(productId);
  if (!resolved || resolved.type !== "one-time") return null;
  return getCreditPackById(resolved.sku);
}
