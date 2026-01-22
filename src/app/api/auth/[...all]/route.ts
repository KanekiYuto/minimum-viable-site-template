import { auth } from "@/server/auth";
import { createAuthRouteHandlers } from "@extensions/auth/server/next-handlers";

export const { GET, POST } = createAuthRouteHandlers(auth);
