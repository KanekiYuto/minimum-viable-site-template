import type { Config } from "drizzle-kit";

const dotenv = require("dotenv");

// 加载环境变量
dotenv.config({ path: ".env.local" });

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
