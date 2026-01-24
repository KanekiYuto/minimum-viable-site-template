import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";

export const authDatabase = drizzleAdapter(db, {
  provider: "pg",
  schema,
});

