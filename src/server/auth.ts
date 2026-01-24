import { createAuth } from "@extensions/auth/server/auth";
import { authDatabase } from "@/server/db/auth-adapter";

export const auth = createAuth({
  database: authDatabase,
});

export type { Session } from "@extensions/auth/server/auth";
