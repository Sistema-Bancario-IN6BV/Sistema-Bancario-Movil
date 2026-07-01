// src/navigation/stacks/MovementsStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import MovementsScreen from '@/features/movements/screens/MovementsScreen';
import MovementDetailScreen from '@/features/movements/screens/MovementDetailScreen';
import { getStackHeaderOptions } from '@/navigation/headerOptions';
import { useColors } from '@/shared/theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function MovementsStack() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={getStackHeaderOptions(colors)}>
      <Stack.Screen name="Movements" component={MovementsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} options={{ title: t('movements.detail') }} />
    </Stack.Navigator>
  );
}
