/**
 * 客户端 store 通用类型。
 *
 * `LoadState` 刻意保持足够小，便于在多个 Zustand store 中复用。
 */
export type LoadState = "idle" | "loading" | "ready" | "error";
