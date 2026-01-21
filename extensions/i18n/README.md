# i18n 扩展说明

该目录封装了项目的国际化能力，便于在多项目之间复用与集中维护。

## 目录结构

- `i18n/`：next-intl 运行时配置与路由工具
- `config/`：语言配置的单一来源（统一由 `config/extensions.ts` 提供）
- `scripts/`：翻译文件合并脚本
- `messages/`：合并后的翻译文件输出目录（默认在项目根）

## 配置来源

语言配置统一维护在 `config/extensions.ts`，包含：
- `locales`：支持的语言列表
- `defaultLocale`：默认语言
- `localeNames`：语言显示名
- `rtlLocales`：RTL 语言列表

已移除 `locales.json`/`locales.js`，语言配置仅维护在 `config/extensions.ts`。

## 运行时接入

`next.config.ts` 已通过 `next-intl` 插件指向：
- `extensions/i18n/i18n/request.ts`

路径别名：
- `@i18n/*` → `extensions/i18n/i18n/*`
- `@extensions/*` → `extensions/*`

## 合并脚本

`scripts/merge-locale-messages.ts` 会把：
- `messages/{locale}/*.json` 合并为 `messages/{locale}.json`

在 `package.json` 中已配置：
- `merge:messages`：运行合并脚本
- `build`：默认先合并再构建

## 注意事项

- 当前项目不包含翻译内容文件，仅保留结构。
- `request.ts` 在找不到合并后的消息文件时会回退空对象，避免运行时报错。
- 如果你希望把 `messages` 输出目录迁移到 `extensions/i18n/messages`，需要同时调整脚本和 `request.ts` 的加载路径。
