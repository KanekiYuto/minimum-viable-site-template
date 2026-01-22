import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type LoadState = "idle" | "loading" | "ready" | "error";

export interface CreditItem {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  remaining: number;
  issuedAt: string;
  expiresAt: string | null;
}

export interface CreditSummary {
  totalRemaining: number;
  totalConsumed: number;
  activeCreditsCount: number;
}

export interface CreditState {
  credits: CreditItem[];
  summary: CreditSummary | null;
  balance: number;
  dailyAvailable: number;
  monthlyUsed: number;
  state: LoadState;
  error?: string;

  setCredits: (data: Partial<Omit<CreditState, "state" | "error">>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (message: string) => void;
  clear: () => void;
  consume: (amount: number) => void;
  refund: (amount: number) => void;
}

export const useCreditStore = create<CreditState>()(
  devtools(
    (set) => ({
      credits: [],
      summary: null,
      balance: 0,
      dailyAvailable: 0,
      monthlyUsed: 0,
      state: "idle",
      error: undefined,

      setCredits: (data) =>
        set(
          (state) => ({
            ...state,
            ...data,
            state: "ready",
            error: undefined,
          }),
          false,
          "setCredits"
        ),

      setLoading: (isLoading) =>
        set(
          (state) => ({
            state: isLoading
              ? "loading"
              : state.state === "loading"
              ? "idle"
              : state.state,
          }),
          false,
          "setLoading"
        ),

      setError: (message) =>
        set(
          {
            error: message,
            state: "error",
          },
          false,
          "setError"
        ),

      clear: () =>
        set(
          {
            credits: [],
            summary: null,
            balance: 0,
            dailyAvailable: 0,
            monthlyUsed: 0,
            state: "idle",
            error: undefined,
          },
          false,
          "clear"
        ),

      consume: (amount) =>
        set(
          (state) => ({
            balance: Math.max(0, state.balance - amount),
          }),
          false,
          "consume"
        ),

      refund: (amount) =>
        set(
          (state) => ({
            balance: state.balance + amount,
          }),
          false,
          "refund"
        ),
    }),
    { name: "CreditStore" }
  )
);
