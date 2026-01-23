/**
 * 浏览器侧：创建支付 Checkout 的轻量封装。
 *
 * 注意：`extensions/payment/core` 只放运行时逻辑，不存放任何配置/数据（如 SKU、价格、套餐定义等）。
 * 这些都应由 app 层提供并通过参数传入。
 */
type CheckoutRequest = {
  productId: string;
  metadata: Record<string, string | number | null>;
  customer: { email: string; name?: string };
  type: 'sub' | 'one-time';
  successUrl?: string;
};

type CheckoutResponse = {
  checkoutUrl?: string;
};

/**
 * 调用站内 API（`/api/payment/checkout`）创建 checkout，并返回跳转 URL。
 *
 * `successUrl` 统一指向 `/api/adapter/creem/:type`：由 adapter 路由负责最终成功后的跳转与落库逻辑。
 */
export const createPaymentCheckout = async (
  payload: CheckoutRequest,
): Promise<CheckoutResponse> => {
  const successUrl = `${window.location.origin}/api/adapter/creem/${payload.type}`;
    
  const response = await fetch('/api/payment/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      successUrl,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }

  return (await response.json()) as CheckoutResponse;
};
