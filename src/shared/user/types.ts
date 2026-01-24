/**
 * User account types used across client & server.
 *
 * Note:
 * - Keep this in sync with whatever persists in DB (string field).
 * - `PlanType` in payment is intentionally more open; `UserType` is the
 *   currently supported set for user records.
 */
export type UserType = "free" | "basic" | "plus" | "pro";

