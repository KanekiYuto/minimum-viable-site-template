import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

/**
 * 主题切换状态管理
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme: ThemeMode) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
