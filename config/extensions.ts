// i18n 路由前缀模式
type LocalePrefix = "always" | "as-needed" | "never";
// One Tap 触发场景
type OneTapContext = "signin" | "signup" | "use";

const extensionsConfig = {
  // i18n 配置（供 next-intl 与中间件使用）
  i18n: {
    // 支持的语言列表
    locales: ["en", "zh-CN"],
    // 默认语言
    defaultLocale: "en",
    // 语言显示名称
    localeNames: {
      en: "English",
      "zh-CN": "简体中文",
    },
    // RTL 语言列表
    rtlLocales: [],
    // 路由前缀策略
    localePrefix: "as-needed" as LocalePrefix,
    // 是否启用语言自动检测
    localeDetection: true,
    // 是否生成 hreflang alternate links
    alternateLinks: true,
  },
  // auth 配置（better-auth 默认值）
  auth: {
    // 邮箱/密码登录开关
    emailAndPassword: {
      enabled: false,
    },
    // Session 生命周期配置
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    // 社交登录开关（密钥仍从环境变量读取）
    socialProviders: {
      google: {
        enabled: true,
      },
      github: {
        enabled: true,
      },
    },
    // 插件配置
    plugins: {
      // Google One Tap
      oneTap: {
        enabled: true,
        autoSelect: false,
        cancelOnTapOutside: true,
        context: "signin" as OneTapContext,
        promptOptions: {
          fedCM: false,
        },
      },
    },
    // 客户端配置
    client: {
      baseURL: process.env.NEXT_PUBLIC_SITE_URL,
    },
  },
};

export type ExtensionsConfig = typeof extensionsConfig;
export { extensionsConfig };