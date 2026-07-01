// src/features/movements/screens/MovementDetailScreen.jsx
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { Card, CurrencyText, Badge, Divider } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { formatDate } from '@/shared/utils/format';
import { shareTransactionReceipt } from '@/shared/utils/receipt';

export default function MovementDetailScreen({ route }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { movement } = route.params || {};

  if (!movement) return null;
  const incoming = movement.direction === 'in';
  const typeLabel = t(`transfers.type.${movement.type}`, { defaultValue: movement.type });
  const statusLabel = t(`transfers.status.${movement.status}`, { defaultValue: movement.status });

  const onShare = () => {
    const lines = [
      t('common.appName'),
      `${t('movements.type')}: ${typeLabel}`,
      `${t('movements.amount')}: ${(incoming ? '+ ' : '- ')}Q ${movement.amount.toFixed(2)}`,
      `${t('movements.date')}: ${formatDate(movement.createdAt)}`,
      movement.reference ? `${t('movements.reference')}: ${movement.reference}` : null,
      movement.description ? `${t('movements.description')}: ${movement.description}` : null,
    ].filter(Boolean);
    shareTransactionReceipt(movement.id, lines.join('\n'));
  };

  return (
    <View style={styles.screen}>
      <Card>
        <View style={styles.top}>
          <View style={[styles.icon, { backgroundColor: incoming ? colors.incomeSurface : colors.expenseSurface }]}>
            <MaterialIcons name={incoming ? 'south-west' : 'north-east'} size={28} color={incoming ? colors.income : colors.expense} />
          </View>
          <CurrencyText
            value={incoming ? movement.amount : -movement.amount}
            currency={movement.currency}
            signed
            style={[styles.amount, { color: incoming ? colors.income : colors.expense }]}
          />
          <Badge label={statusLabel} status={movement.status} />
        </View>

        <Divider />
        <Row label={t('movements.type')} value={typeLabel} />
        <Row label={t('movements.date')} value={formatDate(movement.createdAt)} />
        {movement.sourceNumber ? <Row label={t('transfers.origin')} value={`•••• ${String(movement.sourceNumber).slice(-4)}`} /> : null}
        {movement.destinationNumber ? <Row label={t('transfers.destination')} value={`•••• ${String(movement.destinationNumber).slice(-4)}`} /> : null}
        {movement.reference ? <Row label={t('movements.reference')} value={movement.reference} /> : null}
        {movement.description ? <Row label={t('movements.description')} value={movement.description} /> : null}
      </Card>

      <Button title={t('movements.shareReceipt')} icon="share" variant="secondary" onPress={onShare} style={styles.share} />
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
    top: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
    icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    amount: { fontFamily: FONT.bold, fontSize: FONT_SIZE.display },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
    rowLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight },
    rowValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text, maxWidth: '60%', textAlign: 'right' },
    share: { marginTop: SPACING.lg },
  });
}
