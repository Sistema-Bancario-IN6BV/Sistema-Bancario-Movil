// src/navigation/stacks/ProfileStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import ChangePasswordScreen from '@/features/profile/screens/ChangePasswordScreen';
import SecurityScreen from '@/features/profile/screens/SecurityScreen';
import { getStackHeaderOptions } from '@/navigation/headerOptions';
import { useColors } from '@/shared/theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={getStackHeaderOptions(colors)}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile.title') }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: t('profile.changePassword') }} />
      <Stack.Screen name="Security" component={SecurityScreen} options={{ title: t('profile.security') }} />
    </Stack.Navigator>
  );
}
