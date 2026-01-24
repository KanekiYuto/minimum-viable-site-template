"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { UserType } from "@/shared/user/types";
import type { LoadState } from "./types";

export type { UserType } from "@/shared/user/types";
export type { LoadState } from "./types";

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  type: UserType;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: User | null;
  state: LoadState;
  error?: string;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (message: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      state: "idle",
      error: undefined,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) =>
        set(
          {
            user,
            state: "ready",
            error: undefined,
            isLoading: false,
            isAuthenticated: !!user,
          },
          false,
          "setUser"
        ),

      updateUser: (userData) =>
        set(
          (state) => {
            if (!state.user) return {};

            const updated = { ...state.user, ...userData };
            return {
              user: updated,
            };
          },
          false,
          "updateUser"
        ),

      setLoading: (isLoading) =>
        set(
          (state) => ({
            isLoading,
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
            isLoading: false,
          },
          false,
          "setError"
        ),

      clearUser: () =>
        set(
          {
            user: null,
            state: "idle",
            error: undefined,
            isLoading: false,
            isAuthenticated: false,
          },
          false,
          "clearUser"
        ),
    }),
    { name: "UserStore" }
  )
);
