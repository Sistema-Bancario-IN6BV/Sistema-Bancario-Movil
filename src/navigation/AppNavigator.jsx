// src/navigation/AppNavigator.jsx
import { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { useAuthStore } from '@/shared/store/authStore';
import { useThemeStore } from '@/shared/store/themeStore';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { LoadingSpinner } from '@/shared/components/common/Common';
import AuthStack from '@/navigation/AuthStack';
import MainTabs from '@/navigation/MainTabs';

export default function AppNavigator() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const themeHydrated = useThemeStore((s) => s._hasHydrated);
  const { colors, isDark } = useTheme();

  const navTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.surface,
        primary: colors.primary,
        text: colors.text,
        border: colors.border,
      },
    }),
    [colors, isDark],
  );

  if (!hasHydrated || !themeHydrated) {
    return <LoadingSpinner fullscreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
