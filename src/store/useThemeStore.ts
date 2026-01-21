"use client";

type Theme = "light" | "dark";

export function useThemeStore() {
  return {
    theme: "light" as Theme,
    toggleTheme: () => {},
  };
}
