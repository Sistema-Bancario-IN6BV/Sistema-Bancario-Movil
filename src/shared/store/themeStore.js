// src/shared/store/themeStore.js
// Preferencia de apariencia (claro/oscuro/sistema). Solo el modo se persiste;
// la resolución contra el esquema del sistema ocurre en ThemeProvider.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'system', // 'light' | 'dark' | 'system'
      _hasHydrated: false,

      setMode: (mode) => set({ mode }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'cb-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => () => {
        useThemeStore.setState({ _hasHydrated: true });
      },
    },
  ),
);

export default useThemeStore;
