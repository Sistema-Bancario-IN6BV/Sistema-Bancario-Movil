// src/shared/theme/ThemeProvider.jsx
// Resuelve la preferencia de apariencia (claro/oscuro/sistema) contra el
// esquema del sistema operativo y expone la paleta activa al árbol de la app.
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { PALETTES, SHADOW_PALETTES } from '@/shared/constants/theme';
import { useThemeStore } from '@/shared/store/themeStore';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();

  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(
    () => ({
      mode,
      scheme,
      isDark: scheme === 'dark',
      colors: PALETTES[scheme],
      shadows: SHADOW_PALETTES[scheme],
    }),
    [mode, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}

// Atajo para el caso más común: la mayoría de los componentes solo necesitan colores.
export function useColors() {
  return useTheme().colors;
}

export default ThemeProvider;
