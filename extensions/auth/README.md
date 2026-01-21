# auth 扩展说明

该目录提供与 `better-auth` 相关的基础封装，避免在业务层重复配置。

## 目录结构

- `client/`：客户端 hooks 与 One Tap 配置
- `server/`：服务端 auth factory、Next 路由处理、鉴权包装器

## 使用方式

### 1) 创建 auth 实例

`server/auth.ts` 提供 `createAuth`，需要你传入数据库适配器：

- `database`：由你的项目数据库层提供（例如 drizzle 适配器）
- 可选覆盖：`socialProviders`、`session`、`emailAndPassword`、`plugins`

### 1.1) 配置字段说明

统一在 `config/extensions.ts` 的 `auth` 段维护：

- `emailAndPassword.enabled`：是否启用邮箱/密码登录
- `session.expiresIn`：Session 过期时间（秒）
- `session.updateAge`：Session 刷新间隔（秒）
- `session.cookieCache.enabled`：是否启用 Cookie 缓存
- `session.cookieCache.maxAge`：Cookie 缓存有效期（秒）
- `socialProviders.google.enabled`：是否启用 Google 登录
- `socialProviders.github.enabled`：是否启用 GitHub 登录
- `plugins.oneTap.enabled`：是否启用 Google One Tap
- `plugins.oneTap.autoSelect`：是否自动选中账号
- `plugins.oneTap.cancelOnTapOutside`：点击外部是否取消
- `plugins.oneTap.context`：One Tap 场景（signin/signup/use）
- `plugins.oneTap.promptOptions.fedCM`：是否启用 FedCM
- `client.baseURL`：客户端请求的基础地址

### 2) API 路由

你可以在应用层创建路由，例如：

- `app/api/auth/[...all]/route.ts`

然后使用 `createAuthRouteHandlers(auth)` 返回 `GET/POST` 处理器。

### 3) API 鉴权

使用 `withAuth(auth, handler)` 包装需要鉴权的 API handler。

## 注意事项

- 该扩展不包含数据库层实现，请在应用层注入 `database`。
- 默认配置集中在 `config/extensions.ts` 的 `auth` 段。
- Google/GitHub 社交登录密钥仍从环境变量读取。
- 如果不需要 One Tap，可在 `config/extensions.ts` 里关闭。
