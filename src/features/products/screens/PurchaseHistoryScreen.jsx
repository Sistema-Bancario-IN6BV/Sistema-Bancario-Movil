// src/features/products/screens/PurchaseHistoryScreen.jsx
import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { COLORS, SPACING, RADIUS } from '@/shared/constants/theme';
import { EmptyState, Divider } from '@/shared/components/common/Common';
import { useAccountStore } from '@/shared/store/accountStore';
import { useProducts } from '@/features/products/hooks/useProducts';
import { normalizeMovements } from '@/shared/utils/transactions';
import MovementRow from '@/features/movements/components/MovementRow';

export default function PurchaseHistoryScreen({ navigation }) {
  const { t } = useTranslation();
  const accounts = useAccountStore((s) => s.accounts);
  const getOwnedKeys = useAccountStore((s) => s.getOwnedKeys);
  const { fetchPurchaseHistory } = useProducts();
  const [purchases, setPurchases] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const results = await Promise.all(accounts.map((a) => fetchPurchaseHistory(a.id)));
    const all = results.flat();
    const movements = normalizeMovements(all, getOwnedKeys());
    movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setPurchases(movements);
  }, [accounts, fetchPurchaseHistory, getOwnedKeys]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {purchases.length === 0 ? (
          <EmptyState icon="receipt-long" message={t('products.noPurchases')} />
        ) : (
          <View style={styles.card}>
            {purchases.map((m, i) => (
              <View key={m.id || i}>
                <MovementRow movement={m} onPress={() => navigation.navigate('MovementsTab', { screen: 'MovementDetail', params: { movement: m } })} />
                {i < purchases.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md },
});
