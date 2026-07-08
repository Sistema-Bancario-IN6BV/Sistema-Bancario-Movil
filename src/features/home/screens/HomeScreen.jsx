// src/features/home/screens/HomeScreen.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { useToast } from '@/shared/feedback/FeedbackProvider';
import { CurrencyText, SectionTitle, EmptyState, LoadingSpinner, Divider, ErrorText } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { useAuthStore } from '@/shared/store/authStore';
import { useAccounts } from '@/features/home/hooks/useAccounts';
import { useMovements } from '@/features/movements/hooks/useMovements';
import AccountCard from '@/features/home/components/AccountCard';
import MovementRow from '@/features/movements/components/MovementRow';
import ConversionModal from '@/features/home/components/ConversionModal';

const HIDE_KEY = 'cb_hide_balances';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const showToast = useToast();
  const user = useAuthStore((s) => s.user);
  const {
    accounts, loading, error, totalBalance, refresh, convertBalance,
    hasPendingRequest, requestingAccount, requestError, requestAccount, refreshSummary,
  } = useAccounts();
  const { movements, refresh: refreshMovements } = useMovements({ limit: 5 });

  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [convertFor, setConvertFor] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(HIDE_KEY).then((v) => setHidden(v === '1')).catch(() => {});
  }, []);

  const toggleHidden = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      AsyncStorage.setItem(HIDE_KEY, next ? '1' : '0').catch(() => {});
      return next;
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshMovements(), refreshSummary()]);
    setRefreshing(false);
  }, [refresh, refreshMovements, refreshSummary]);

  const goNewTransfer = () => navigation.navigate('TransfersTab', { screen: 'NewTransfer' });
  const goFavorites = () => navigation.navigate('TransfersTab', { screen: 'SelectFavorite' });
  const openConvert = () => {
    if (accounts[0]) setConvertFor(accounts[0]);
  };

  const onRequestAccount = async () => {
    const res = await requestAccount();
    if (res.ok) {
      showToast(t('accounts.requestSuccess'), { variant: 'success' });
    }
  };

  const recent = movements.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{t('accounts.greeting', { name: user?.username || '' })}</Text>
            <Text style={styles.appName}>{t('common.appName')}</Text>
          </View>
          <Pressable onPress={toggleHidden} hitSlop={8} style={styles.eyeBtn}>
            <MaterialIcons name={hidden ? 'visibility-off' : 'visibility'} size={22} color={colors.primary} />
          </Pressable>
        </View>

        {/* Saldo total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t('accounts.totalBalance')}</Text>
          <CurrencyText value={totalBalance} hidden={hidden} style={styles.totalValue} />
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickRow}>
          <QuickAction icon="swap-horiz" label={t('accounts.transfer')} onPress={goNewTransfer} />
          <QuickAction icon="currency-exchange" label={t('accounts.convert')} onPress={openConvert} />
          <QuickAction icon="star" label={t('accounts.favorites')} onPress={goFavorites} />
        </View>

        {/* Cuentas */}
        <SectionTitle>{t('accounts.myAccounts')}</SectionTitle>
        {loading && accounts.length === 0 ? (
          <LoadingSpinner />
        ) : accounts.length === 0 ? (
          <View>
            <EmptyState
              icon={hasPendingRequest ? 'hourglass-empty' : 'account-balance'}
              message={hasPendingRequest ? t('accounts.requestPending') : (error || t('accounts.noAccounts'))}
            />
            {!hasPendingRequest ? (
              <>
                <ErrorText>{requestError}</ErrorText>
                <Button
                  title={t('accounts.requestAccount')}
                  icon="add-circle-outline"
                  onPress={onRequestAccount}
                  loading={requestingAccount}
                  style={styles.requestBtn}
                />
              </>
            ) : null}
          </View>
        ) : (
          accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              hidden={hidden}
              onPress={() => navigation.navigate('AccountDetail', { accountId: acc.id })}
            />
          ))
        )}

        {/* Movimientos recientes */}
        {accounts.length > 0 ? (
          <>
            <SectionTitle action={t('accounts.viewAll')} onAction={() => navigation.navigate('MovementsTab')}>
              {t('accounts.recentMovements')}
            </SectionTitle>
            {recent.length === 0 ? (
              <EmptyState icon="receipt-long" message={t('movements.noMovements')} />
            ) : (
              <View style={styles.movementsCard}>
                {recent.map((m, i) => (
                  <View key={m.id || i}>
                    <MovementRow
                      movement={m}
                      hidden={hidden}
                      onPress={() => navigation.navigate('MovementDetail', { movement: m })}
                    />
                    {i < recent.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      <ConversionModal
        visible={!!convertFor}
        accountId={convertFor?.id}
        convertBalance={convertBalance}
        onClose={() => setConvertFor(null)}
      />
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickItem, pressed && styles.quickPressed]}>
      <View style={styles.quickIcon}>
        <MaterialIcons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
    greeting: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight },
    appName: { fontFamily: FONT.bold, fontSize: FONT_SIZE.headline, color: colors.text },
    eyeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    totalCard: { backgroundColor: colors.primary, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg },
    totalLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.onPrimary, opacity: 0.8 },
    totalValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.display, color: colors.onPrimary, marginTop: SPACING.xs },
    quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
    quickItem: { flex: 1, backgroundColor: colors.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border, paddingVertical: SPACING.md, alignItems: 'center', gap: SPACING.sm },
    quickPressed: { opacity: 0.85 },
    quickIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lightTealSurface, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontFamily: FONT.bold, fontSize: FONT_SIZE.caption, color: colors.textVariant, textAlign: 'center' },
    movementsCard: { backgroundColor: colors.surface, borderRadius: RADIUS.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: SPACING.md },
    requestBtn: { marginTop: SPACING.sm },
  });
}
