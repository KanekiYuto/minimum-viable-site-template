import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthLike = {
  api: {
    getSession: (args: { headers: Headers }) => Promise<any>;
  };
};

// 认证校验的 handler 包装器
export function withAuth(
  auth: AuthLike,
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    // 从请求头读取会话信息
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // 未登录则直接返回 401
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 透传会话给后续 handler 使用
    (request as any).session = session;
    return handler(request, context);
  };
}
