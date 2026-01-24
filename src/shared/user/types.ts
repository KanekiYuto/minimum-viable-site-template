/**
 * 用户账户相关类型（client/server 共用）。
 *
 * 注意：
 * - 请与 DB 持久化字段（string）保持一致。
 * - payment 侧的 `PlanType` 刻意保持更开放；`UserType` 代表当前用户记录支持的集合。
 */
export type UserType = "free" | "basic" | "plus" | "pro";
