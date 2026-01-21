import { toNextJsHandler } from "better-auth/next-js";

// 将 better-auth 实例转为 Next.js 路由处理器
export function createAuthRouteHandlers(auth: unknown) {
  return toNextJsHandler(auth as any);
}
