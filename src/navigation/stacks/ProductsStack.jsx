// src/navigation/stacks/ProductsStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ProductsScreen from '@/features/products/screens/ProductsScreen';
import ProductDetailScreen from '@/features/products/screens/ProductDetailScreen';
import PurchaseReceiptScreen from '@/features/products/screens/PurchaseReceiptScreen';
import PurchaseHistoryScreen from '@/features/products/screens/PurchaseHistoryScreen';
import { getStackHeaderOptions } from '@/navigation/headerOptions';
import { useColors } from '@/shared/theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function ProductsStack() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={getStackHeaderOptions(colors)}>
      <Stack.Screen name="Products" component={ProductsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: t('products.detail') }} />
      <Stack.Screen name="PurchaseReceipt" component={PurchaseReceiptScreen} options={{ title: t('products.receiptTitle'), headerBackVisible: false }} />
      <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} options={{ title: t('products.purchaseHistory') }} />
    </Stack.Navigator>
  );
}
