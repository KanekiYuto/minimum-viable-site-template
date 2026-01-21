import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { oneTap } from "better-auth/plugins";
import { extensionsConfig } from "@config/extensions";

type BetterAuthOptions = Parameters<typeof betterAuth>[0];

export type AuthFactoryOptions = {
  database: BetterAuthOptions["database"];
  socialProviders: BetterAuthOptions["socialProviders"];
  emailAndPassword: BetterAuthOptions["emailAndPassword"];
  session: BetterAuthOptions["session"];
  plugins: BetterAuthOptions["plugins"];
};

export function createAuth(options: AuthFactoryOptions) {
  // 统一从扩展配置读取默认策略
  const { auth } = extensionsConfig;

  // 根据配置构建社交登录提供商
  const socialProviders: BetterAuthOptions["socialProviders"] = {};
  if (auth.socialProviders.google.enabled) {
    socialProviders.google = {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    };
  }
  if (auth.socialProviders.github.enabled) {
    socialProviders.github = {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    };
  }

  // 默认启用 nextCookies，可选开启 One Tap
  const plugins: BetterAuthOptions["plugins"] = [nextCookies()];
  if (auth.plugins.oneTap.enabled) {
    plugins.push(oneTap());
  }

  // 以配置为默认值，允许调用方覆盖
  const baseOptions: BetterAuthOptions = {
    database: options.database,
    emailAndPassword: auth.emailAndPassword,
    socialProviders,
    session: auth.session,
    plugins,
  };

  return betterAuth({
    ...baseOptions,
    ...options,
    socialProviders: options.socialProviders ?? baseOptions.socialProviders,
    emailAndPassword: options.emailAndPassword ?? baseOptions.emailAndPassword,
    session: options.session ?? baseOptions.session,
    plugins: options.plugins ?? baseOptions.plugins,
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
