/**
 * 全局 fetch 配置（Node.js）
 *
 * - 在代理环境下让 Node fetch 走 http_proxy/https_proxy（通过 undici ProxyAgent）
 * - 为部分外部请求（例如 Google OAuth）提供超时与重试，缓解偶发的 ConnectTimeout/ETIMEDOUT
 */

type TimeoutishError = {
  name?: unknown;
  message?: unknown;
  cause?: unknown;
};

function isTimeoutError(error: unknown): boolean {
  const err = error as TimeoutishError & { cause?: { code?: unknown } };
  const name = typeof err?.name === "string" ? err.name : "";
  const message = typeof err?.message === "string" ? err.message : "";
  const causeCode =
    typeof err?.cause === "object" && err?.cause
      ? (err.cause as { code?: unknown }).code
      : undefined;
  const causeCodeStr = typeof causeCode === "string" ? causeCode : "";

  return (
    name.includes("Abort") ||
    message.includes("ETIMEDOUT") ||
    message.toLowerCase().includes("timeout") ||
    causeCodeStr.includes("TIMEOUT")
  );
}

function getUrlString(input: RequestInfo | URL): string | undefined {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  // Request
  return typeof (input as { url?: unknown })?.url === "string"
    ? (input as { url: string }).url
    : undefined;
}

function isGoogleOAuthRequest(input: RequestInfo | URL): boolean {
  const url = getUrlString(input);
  return Boolean(
    url &&
      (url.includes("googleapis.com") ||
        url.includes("accounts.google.com") ||
        url.includes("oauth2.googleapis.com"))
  );
}

async function fetchWithRetry(
  originalFetch: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit = {},
  retries = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutMs = attempt === 1 ? 30_000 : attempt * 15_000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedSignal =
        init.signal && typeof AbortSignal !== "undefined" && "any" in AbortSignal
          ? // Node 20+
            AbortSignal.any([init.signal, controller.signal])
          : init.signal ?? controller.signal;

      const response = await originalFetch(input, { ...init, signal: mergedSignal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt === retries || !isTimeoutError(error)) {
        throw error;
      }

      const waitMs = attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

class ProxyConfig {
  readonly httpProxy?: string;
  readonly httpsProxy?: string;
  readonly proxyUrl?: string;

  constructor() {
    this.httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
    this.httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
    this.proxyUrl = this.httpsProxy || this.httpProxy;
  }

  hasProxy(): boolean {
    return Boolean(this.proxyUrl);
  }
}

const UNDICI_CONFIG = {
  connectTimeout: 45_000,
  headersTimeout: 45_000,
  bodyTimeout: 90_000,
  keepAliveTimeout: 60_000,
  keepAliveMaxTimeout: 600_000,
} as const;

async function configureUndiciDispatcher(proxy: ProxyConfig): Promise<void> {
  // undici 是 Next/Node fetch 的底层实现；通过 setGlobalDispatcher 才能让 fetch 走代理
  const undici = await import("undici");

  if (!("setGlobalDispatcher" in undici)) return;

  if (proxy.hasProxy()) {
    const dispatcher = new undici.ProxyAgent({
      uri: proxy.proxyUrl!,
      ...UNDICI_CONFIG,
    });
    undici.setGlobalDispatcher(dispatcher);
  } else {
    const dispatcher = new undici.Agent({
      ...UNDICI_CONFIG,
      maxCachedSessions: 100,
      connections: 50,
    });
    undici.setGlobalDispatcher(dispatcher);
  }
}

async function configureHttpAgents(proxy: ProxyConfig): Promise<void> {
  if (!proxy.hasProxy()) return;

  // 部分库仍会直接用 http/https.request；为它们补代理（可选）。
  //
  // 注意：在 ESM module namespace 上 `http.globalAgent`/`https.globalAgent` 可能是只读导出，
  // 直接赋值会抛错（你看到的就是这个）。因此这里仅在 `require` 可用时才覆盖。
  let http: typeof import("node:http");
  let https: typeof import("node:https");

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    http = require("node:http");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    https = require("node:https");
  } catch {
    return;
  }

  const { HttpsProxyAgent } = await import("https-proxy-agent");

  const agent = new HttpsProxyAgent(proxy.proxyUrl!, {
    keepAlive: true,
  });

  http.globalAgent = agent;
  https.globalAgent = agent;
}

function configureFetchRetry(originalFetch: typeof fetch): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const retries = isGoogleOAuthRequest(input) ? 3 : 1;
    return fetchWithRetry(originalFetch, input, init ?? {}, retries);
  };
}

declare global {
  var __fetchConfigLoaded: boolean | undefined;
}

async function main() {
  if (process.env.NODE_ENV === "test") return;
  if (globalThis.__fetchConfigLoaded) return;
  globalThis.__fetchConfigLoaded = true;

  const proxy = new ProxyConfig();

  try {
    await configureUndiciDispatcher(proxy);
  } catch (error) {
    console.error("[fetch-config] Failed to configure undici dispatcher:", error);
  }

  try {
    await configureHttpAgents(proxy);
  } catch (error) {
    console.error("[fetch-config] Failed to configure http(s) agents:", error);
  }

  const originalFetch = globalThis.fetch;
  if (typeof originalFetch === "function") {
    globalThis.fetch = configureFetchRetry(originalFetch.bind(globalThis));
  }
}

// instrumentation.ts 会 import 该模块；在 Node runtime 启动阶段执行一次
void main();

export {};
