// src/features/movements/components/MovementRow.jsx
import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { CurrencyText } from '@/shared/components/common/Common';
import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { formatDateShort } from '@/shared/utils/format';

export default function MovementRow({ movement, onPress, hidden }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const incoming = movement.direction === 'in';
  const typeLabel = t(`transfers.type.${movement.type}`, { defaultValue: movement.type });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: incoming ? colors.incomeSurface : colors.expenseSurface }]}>
        <MaterialIcons
          name={incoming ? 'south-west' : 'north-east'}
          size={18}
          color={incoming ? colors.income : colors.expense}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {movement.description || typeLabel}
        </Text>
        <Text style={styles.meta}>{formatDateShort(movement.createdAt)}</Text>
      </View>
      <CurrencyText
        value={incoming ? movement.amount : -movement.amount}
        currency={movement.currency}
        hidden={hidden}
        signed
        style={[styles.amount, { color: incoming ? colors.income : colors.expense }]}
      />
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
    pressed: { opacity: 0.7 },
    icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    info: { flex: 1 },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
    meta: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, marginTop: 2 },
    amount: { fontSize: FONT_SIZE.body },
  });
}
