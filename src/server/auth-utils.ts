import { auth } from "@/server/auth";

export async function getSessionUserId(
  request: Request
): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}
