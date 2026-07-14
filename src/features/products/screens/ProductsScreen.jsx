// src/features/products/screens/ProductsScreen.jsx
import { useState, useCallback, useMemo } from 'react';
import { Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { SectionTitle, EmptyState } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { useProducts } from '@/features/products/hooks/useProducts';
import ProductCard from '@/features/products/components/ProductCard';

export default function ProductsScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { products, refreshProducts } = useProducts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  }, [refreshProducts]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>{t('products.title')}</Text>

        <Button
          title={t('products.purchaseHistory')}
          icon="history"
          variant="secondary"
          onPress={() => navigation.navigate('PurchaseHistory')}
          style={styles.historyBtn}
        />

        <SectionTitle>{t('products.catalog')}</SectionTitle>
        {products.length === 0 ? (
          <EmptyState icon="storefront" message={t('products.empty')} />
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} product={p} onPress={() => navigation.navigate('ProductDetail', { product: p })} />
          ))
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
    historyBtn: { marginBottom: SPACING.sm },
  });
}
