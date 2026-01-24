"use client";

import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";
import { extensionsConfig } from "@config/extensions";

// 从扩展配置读取客户端参数
const { auth } = extensionsConfig;

const plugins = [];
if (auth.plugins.oneTap.enabled) {
  plugins.push(
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      // 一键登录（One Tap）行为配置（可在 extensions.ts 统一调整）
      autoSelect: auth.plugins.oneTap.autoSelect,
      cancelOnTapOutside: auth.plugins.oneTap.cancelOnTapOutside,
      context: auth.plugins.oneTap.context,
      promptOptions: auth.plugins.oneTap.promptOptions,
    })
  );
}

export const authClient = createAuthClient({
  // 统一的服务端基础地址
  baseURL: auth.client.baseURL,
  plugins,
});

export const { useSession, signIn, signOut, oneTap } = authClient;
