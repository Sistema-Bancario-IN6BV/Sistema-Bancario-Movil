// App.jsx
import { useCallback } from 'react';
import { View, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import {
  useFonts,
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

import i18n from '@/shared/i18n';
import { ThemeProvider, useTheme } from '@/shared/theme/ThemeProvider';
import { FeedbackProvider } from '@/shared/feedback/FeedbackProvider';
import { LoadingSpinner } from '@/shared/components/common/Common';
import AppNavigator from '@/navigation/AppNavigator';
import AppLock from '@/security/AppLock';

// La app solo usa notificaciones LOCALES. expo-notifications emite este
// warning en Expo Go porque su módulo nativo incluye el path de push remoto,
// que Expo Go no soporta desde SDK 53; no aplica a esta app y no aparece en un dev build.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

function AppShell() {
  const { colors, isDark } = useTheme();
  const [fontsLoaded] = useFonts({
    OpenSans_300Light,
    OpenSans_400Regular,
    OpenSans_700Bold,
  });

  const renderApp = useCallback(() => {
    if (!fontsLoaded) {
      return <LoadingSpinner fullscreen />;
    }
    return (
      <AppLock>
        <AppNavigator />
      </AppLock>
    );
  }, [fontsLoaded]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* colors.primary se aclara en oscuro (para contraste de iconos), así
          que la barra de estado necesita el patrón de íconos inverso. */}
      <StatusBar style={isDark ? 'dark' : 'light'} backgroundColor={colors.primary} />
      {renderApp()}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <FeedbackProvider>
            <AppShell />
          </FeedbackProvider>
        </ThemeProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
