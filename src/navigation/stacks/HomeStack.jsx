// src/navigation/stacks/HomeStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import HomeScreen from '@/features/home/screens/HomeScreen';
import AccountDetailScreen from '@/features/home/screens/AccountDetailScreen';
import MovementDetailScreen from '@/features/movements/screens/MovementDetailScreen';
import { getStackHeaderOptions } from '@/navigation/headerOptions';
import { useColors } from '@/shared/theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={getStackHeaderOptions(colors)}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} options={{ title: t('accounts.accountDetail') }} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} options={{ title: t('movements.detail') }} />
    </Stack.Navigator>
  );
}
