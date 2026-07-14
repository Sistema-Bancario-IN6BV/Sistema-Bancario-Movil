// src/features/transfers/screens/TransfersScreen.jsx
import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { SectionTitle, EmptyState, Divider, Badge } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { useMovements } from '@/features/movements/hooks/useMovements';
import { useTransfers } from '@/features/transfers/hooks/useTransfers';
import { useTransferStore } from '@/shared/store/transferStore';
import MovementRow from '@/features/movements/components/MovementRow';

export default function TransfersScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { movements, refresh: refreshMovements } = useMovements();
  const { favorites, refreshFavorites } = useTransfers();
  const setDestination = useTransferStore((s) => s.setDestination);
  const clearDraft = useTransferStore((s) => s.clearDraft);
  const [refreshing, setRefreshing] = useState(false);

  const transfers = useMemo(() => movements.filter((m) => m.type === 'TRANSFER'), [movements]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshMovements(), refreshFavorites()]);
    setRefreshing(false);
  }, [refreshMovements, refreshFavorites]);

  const startNew = () => {
    clearDraft();
    navigation.navigate('NewTransfer');
  };

  const quickFromFavorite = (fav) => {
    clearDraft();
    setDestination({ type: 'favorite', favoriteId: fav.id, alias: fav.alias, accountNumber: fav.accountNumber });
    navigation.navigate('NewTransfer');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>{t('transfers.title')}</Text>

        <Button title={t('transfers.newTransfer')} icon="add" onPress={startNew} style={styles.newBtn} />

        {/* Favoritos frecuentes */}
        <SectionTitle action={t('common.add')} onAction={() => navigation.navigate('SelectFavorite')}>
          {t('transfers.frequentBeneficiaries')}
        </SectionTitle>
        {favorites.length === 0 ? (
          <EmptyState icon="star-border" message={t('transfers.noFavorites')} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favRow}>
            {favorites.map((fav) => (
              <Pressable key={fav.id} onPress={() => quickFromFavorite(fav)} style={styles.favCard}>
                <View style={styles.favIcon}>
                  <MaterialIcons name="star" size={20} color={colors.warning} />
                </View>
                <Text style={styles.favAlias} numberOfLines={1}>{fav.alias}</Text>
                <Text style={styles.favNumber}>•••• {String(fav.accountNumber || '').slice(-4)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Historial */}
        <SectionTitle>{t('transfers.history')}</SectionTitle>
        {transfers.length === 0 ? (
          <EmptyState icon="swap-horiz" message={t('transfers.noTransfers')} />
        ) : (
          <View style={styles.historyCard}>
            {transfers.map((m, i) => (
              <View key={m.id || i}>
                <View style={styles.historyRow}>
                  <MovementRow movement={m} onPress={() => navigation.navigate('MovementsTab', { screen: 'MovementDetail', params: { movement: m } })} />
                </View>
                {i < transfers.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.headline, color: colors.text, marginBottom: SPACING.md },
    newBtn: { marginBottom: SPACING.sm },
    favRow: { gap: SPACING.sm, paddingVertical: SPACING.xs },
    favCard: { width: 120, backgroundColor: colors.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border, padding: SPACING.md, gap: 4 },
    favIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.warningSurface, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
    favAlias: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
    favNumber: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight },
    historyCard: { backgroundColor: colors.surface, borderRadius: RADIUS.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: SPACING.md },
    historyRow: {},
  });
}
