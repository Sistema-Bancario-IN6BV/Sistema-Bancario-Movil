// src/features/home/screens/AccountDetailScreen.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import {
  Card,
  CurrencyText,
  MaskedNumber,
  Badge,
  SectionTitle,
  EmptyState,
  Divider,
} from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { useAccountStore } from '@/shared/store/accountStore';
import { useAccounts } from '@/features/home/hooks/useAccounts';
import { useMovements } from '@/features/movements/hooks/useMovements';
import MovementRow from '@/features/movements/components/MovementRow';
import ConversionModal from '@/features/home/components/ConversionModal';

export default function AccountDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { accountId } = route.params || {};
  const getById = useAccountStore((s) => s.getById);
  const { convertBalance } = useAccounts();
  const { movements, refresh } = useMovements();

  const [account, setAccount] = useState(getById(accountId));
  const [showConvert, setShowConvert] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    setAccount(getById(accountId));
  }, [accountId, getById]);

  const accountMovements = useMemo(() => {
    if (!account) return [];
    return movements.filter(
      (m) => m.sourceNumber === account.accountNumber || m.destinationNumber === account.accountNumber,
    );
  }, [movements, account]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (!account) {
    return <EmptyState icon="account-balance" />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Card style={styles.hero}>
        <View style={styles.heroRow}>
          <Text style={styles.heroLabel}>{t('accounts.accountNumber')}</Text>
          <Badge label={account.status} variant={account.status === 'ACTIVE' ? 'success' : 'warning'} />
        </View>
        <MaskedNumber value={account.accountNumber} visible={showNumber} style={styles.heroNumber} />
        <Text
          style={styles.toggleNumber}
          onPress={() => setShowNumber((s) => !s)}
        >
          {showNumber ? t('accounts.hideNumber') : t('accounts.showNumber')}
        </Text>
        <Divider />
        <Text style={styles.heroLabel}>{t('accounts.balance')}</Text>
        <CurrencyText value={account.balance} currency={account.currency} style={styles.heroBalance} />
        <Button
          title={t('accounts.convert')}
          icon="currency-exchange"
          variant="secondary"
          onPress={() => setShowConvert(true)}
          style={styles.convertBtn}
        />
      </Card>

      <SectionTitle>{t('accounts.recentMovements')}</SectionTitle>
      {accountMovements.length === 0 ? (
        <EmptyState icon="receipt-long" message={t('movements.noMovements')} />
      ) : (
        <View style={styles.list}>
          {accountMovements.map((m, i) => (
            <View key={m.id || i}>
              <MovementRow movement={m} onPress={() => navigation.navigate('MovementDetail', { movement: m })} />
              {i < accountMovements.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      )}

      <ConversionModal
        visible={showConvert}
        accountId={account.id}
        convertBalance={convertBalance}
        onClose={() => setShowConvert(false)}
      />
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
    hero: { marginBottom: SPACING.sm },
    heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, marginTop: SPACING.sm },
    heroNumber: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text, marginTop: 2 },
    toggleNumber: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.secondary, marginTop: SPACING.xs },
    heroBalance: { fontFamily: FONT.bold, fontSize: FONT_SIZE.display, color: colors.primary, marginTop: 2 },
    convertBtn: { marginTop: SPACING.md },
    list: { backgroundColor: colors.surface, borderRadius: RADIUS.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: SPACING.md },
  });
}
