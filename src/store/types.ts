/**
 * Client stores shareable types.
 *
 * `LoadState` is intentionally tiny and reusable across multiple Zustand stores.
 */
export type LoadState = "idle" | "loading" | "ready" | "error";

