// src/features/home/components/AccountCard.jsx
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, CurrencyText, MaskedNumber } from '@/shared/components/common/Common';
import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';

export default function AccountCard({ account, hidden, onPress, showFullNumber = false }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="account-balance-wallet" size={20} color={colors.onPrimary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{t('accounts.account')}</Text>
          <MaskedNumber value={account.accountNumber} visible={showFullNumber} style={styles.number} />
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.textLight} />
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>{t('accounts.balance')}</Text>
        <CurrencyText value={account.balance} currency={account.currency} hidden={hidden} style={styles.balance} />
      </View>
    </Card>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    card: { marginBottom: SPACING.md },
    header: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    info: { flex: 1 },
    label: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight },
    number: { fontFamily: FONT.bold, fontSize: FONT_SIZE.bodyLg, color: colors.text, marginTop: 2 },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    balanceLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight },
    balance: { fontSize: FONT_SIZE.title },
  });
}
