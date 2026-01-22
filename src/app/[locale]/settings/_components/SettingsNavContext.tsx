"use client";

import { createContext, useContext, type ReactNode } from "react";

type SettingsNavContextValue = {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

const SettingsNavContext = createContext<SettingsNavContextValue | null>(null);

export function SettingsNavProvider({
  value,
  children,
}: {
  value: SettingsNavContextValue;
  children: ReactNode;
}) {
  return (
    <SettingsNavContext.Provider value={value}>
      {children}
    </SettingsNavContext.Provider>
  );
}

export function useSettingsNav() {
  const ctx = useContext(SettingsNavContext);
  if (!ctx) {
    throw new Error("useSettingsNav must be used within <SettingsNavProvider />");
  }
  return ctx;
}
