// src/features/products/screens/PurchaseReceiptScreen.jsx
import { useMemo } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { Card, CurrencyText, Divider } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export default function PurchaseReceiptScreen({ route, navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { receipt } = route.params || {};

  if (!receipt) return null;

  const onShare = () => {
    const lines = [
      t('common.appName'),
      t('products.purchaseDone'),
      `${t('products.product')}: ${receipt.productName}`,
      `${t('products.price')}: ${formatCurrency(receipt.amount)}`,
      `${t('transfers.origin')}: •••• ${String(receipt.accountNumber || '').slice(-4)}`,
      `${t('products.pointsEarned')}: +${receipt.earnedPoints}`,
      receipt.reference ? `${t('movements.reference')}: ${receipt.reference}` : null,
      `${t('movements.date')}: ${formatDate(receipt.date)}`,
    ].filter(Boolean);
    Share.share({ message: lines.join('\n') });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.successHeader}>
        <View style={styles.check}>
          <MaterialIcons name="check" size={36} color={colors.onPrimary} />
        </View>
        <Text style={styles.successText}>{t('products.purchaseDone')}</Text>
        <CurrencyText value={receipt.amount} style={styles.amount} />
      </View>

      <Card>
        <Row label={t('products.product')} value={receipt.productName} />
        <Row label={t('transfers.origin')} value={`•••• ${String(receipt.accountNumber || '').slice(-4)}`} />
        <Row label={t('products.pointsEarned')} value={`+${receipt.earnedPoints}`} />
        {receipt.reference ? <Row label={t('movements.reference')} value={receipt.reference} /> : null}
        <Divider />
        <Row label={t('movements.date')} value={formatDate(receipt.date)} />
      </Card>

      <Button title={t('common.share')} icon="share" variant="secondary" onPress={onShare} style={styles.share} />
      <Button title={t('common.close')} onPress={() => navigation.navigate('Products')} style={styles.close} />
    </View>
  );
}

function Row({ label, value }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background, padding: SPACING.gutter },
    successHeader: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
    check: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
    successText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text },
    amount: { fontFamily: FONT.bold, fontSize: FONT_SIZE.display, color: colors.primary },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
    rowLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight },
    rowValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text, maxWidth: '60%', textAlign: 'right' },
    share: { marginTop: SPACING.lg },
    close: { marginTop: SPACING.sm },
  });
}
