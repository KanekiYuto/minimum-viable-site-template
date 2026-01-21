"use client";

type User = {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
};

export function useUserStore() {
  return {
    user: null as User | null,
    isLoading: false,
    clearUser: () => {},
  };
}
