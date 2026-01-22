import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuth } from "@extensions/auth/server/auth";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";

export const auth = createAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});

export type Session = typeof auth.$Infer.Session;
