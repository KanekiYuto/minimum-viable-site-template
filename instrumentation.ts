/**
 * Next.js Instrumentation 文件
 *
 * 该文件会在服务器启动时执行，用来做全局初始化（例如：为 Node.js fetch 配置代理、超时与重试）。
 * 文档: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 只在 Node.js runtime 中执行（Edge runtime 不支持 Node 的网络 Agent/undici Dispatcher）
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./src/server/fetch-config");
  }
}

