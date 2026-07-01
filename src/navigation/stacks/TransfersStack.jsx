// src/navigation/stacks/TransfersStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import TransfersScreen from '@/features/transfers/screens/TransfersScreen';
import NewTransferScreen from '@/features/transfers/screens/NewTransferScreen';
import SelectFavoriteScreen from '@/features/transfers/screens/SelectFavoriteScreen';
import ConfirmTransferScreen from '@/features/transfers/screens/ConfirmTransferScreen';
import TransferReceiptScreen from '@/features/transfers/screens/TransferReceiptScreen';
import { getStackHeaderOptions } from '@/navigation/headerOptions';
import { useColors } from '@/shared/theme/ThemeProvider';

const Stack = createNativeStackNavigator();

export default function TransfersStack() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Stack.Navigator screenOptions={getStackHeaderOptions(colors)}>
      <Stack.Screen name="Transfers" component={TransfersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NewTransfer" component={NewTransferScreen} options={{ title: t('transfers.newTransfer') }} />
      <Stack.Screen name="SelectFavorite" component={SelectFavoriteScreen} options={{ title: t('transfers.selectFavorite') }} />
      <Stack.Screen name="ConfirmTransfer" component={ConfirmTransferScreen} options={{ title: t('transfers.confirmTransfer') }} />
      <Stack.Screen name="TransferReceipt" component={TransferReceiptScreen} options={{ title: t('transfers.receiptTitle'), headerBackVisible: false }} />
    </Stack.Navigator>
  );
}
