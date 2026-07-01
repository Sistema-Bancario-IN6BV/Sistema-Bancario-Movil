// src/features/products/screens/PurchaseReceiptScreen.jsx
import { View, Text, StyleSheet, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { COLORS, SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { Card, CurrencyText, Divider } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { formatCurrency, formatDate } from '@/shared/utils/format';

export default function PurchaseReceiptScreen({ route, navigation }) {
  const { t } = useTranslation();
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
          <MaterialIcons name="check" size={36} color={COLORS.onPrimary} />
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
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.gutter },
  successHeader: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  check: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  successText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: COLORS.text },
  amount: { fontFamily: FONT.bold, fontSize: FONT_SIZE.display, color: COLORS.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
  rowLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: COLORS.textLight },
  rowValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
  share: { marginTop: SPACING.lg },
  close: { marginTop: SPACING.sm },
});
