// src/features/movements/screens/MovementsScreen.jsx
import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { EmptyState, LoadingSpinner, Divider } from '@/shared/components/common/Common';
import { useMovements } from '@/features/movements/hooks/useMovements';
import MovementRow from '@/features/movements/components/MovementRow';

const TYPE_FILTERS = ['ALL', 'TRANSFER', 'DEPOSIT', 'CREDIT'];

export default function MovementsScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { movements, loading, error, refresh } = useMovements();
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(
    () => (filter === 'ALL' ? movements : movements.filter((m) => m.type === filter)),
    [movements, filter],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('movements.title')}</Text>
      </View>

      <View style={styles.filters}>
        {TYPE_FILTERS.map((f) => {
          const active = filter === f;
          const label = f === 'ALL' ? t('common.all') : t(`transfers.type.${f}`, { defaultValue: f });
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading && movements.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.id || String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MovementRow movement={item} onPress={() => navigation.navigate('MovementDetail', { movement: item })} />
          )}
          ItemSeparatorComponent={Divider}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="receipt-long" message={error || t('movements.noMovements')} />}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: SPACING.gutter, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.headline, color: colors.text },
    filters: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingHorizontal: SPACING.gutter, paddingBottom: SPACING.sm },
    chip: { borderWidth: 1, borderColor: colors.border, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 6, backgroundColor: colors.surface },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.textVariant },
    chipTextActive: { color: colors.onPrimary },
    listContent: { paddingHorizontal: SPACING.gutter, paddingBottom: SPACING.xl, flexGrow: 1 },
  });
}
