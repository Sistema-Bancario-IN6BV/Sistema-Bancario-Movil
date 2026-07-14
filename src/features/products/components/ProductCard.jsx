// src/features/products/components/ProductCard.jsx
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { Card, CurrencyText } from '@/shared/components/common/Common';

export default function ProductCard({ product, onPress }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.icon}>
        <MaterialIcons name="storefront" size={22} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        ) : null}
      </View>
      <View style={styles.priceBox}>
        <CurrencyText value={product.price} style={styles.price} />
        <MaterialIcons name="chevron-right" size={20} color={colors.textLight} />
      </View>
    </Card>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    name: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
    description: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, marginTop: 2 },
    priceBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    price: { fontSize: FONT_SIZE.body },
  });
}
