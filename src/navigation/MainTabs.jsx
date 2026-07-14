// src/navigation/MainTabs.jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import HomeStack from '@/navigation/stacks/HomeStack';
import TransfersStack from '@/navigation/stacks/TransfersStack';
import MovementsStack from '@/navigation/stacks/MovementsStack';
import ProductsStack from '@/navigation/stacks/ProductsStack';
import ProfileStack from '@/navigation/stacks/ProfileStack';

const Tab = createBottomTabNavigator();

const ICONS = {
  HomeTab: 'home',
  TransfersTab: 'swap-horiz',
  MovementsTab: 'receipt-long',
  ProductsTab: 'storefront',
  ProfileTab: 'person',
};

export default function MainTabs() {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: FONT.bold, fontSize: FONT_SIZE.caption },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: t('navigation.home') }} />
      <Tab.Screen name="TransfersTab" component={TransfersStack} options={{ title: t('navigation.transfers') }} />
      <Tab.Screen name="MovementsTab" component={MovementsStack} options={{ title: t('navigation.movements') }} />
      <Tab.Screen name="ProductsTab" component={ProductsStack} options={{ title: t('navigation.products') }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: t('navigation.profile') }} />
    </Tab.Navigator>
  );
}
