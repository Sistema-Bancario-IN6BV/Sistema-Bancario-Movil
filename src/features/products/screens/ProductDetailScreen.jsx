// src/features/products/screens/ProductDetailScreen.jsx
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { COLORS, SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { Card, CurrencyText, Divider, ErrorText, MaskedNumber } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { useAccountStore } from '@/shared/store/accountStore';
import { useProducts } from '@/features/products/hooks/useProducts';
import { getPreferredAuth, authenticateBiometric } from '@/security/biometric';
import PinModal from '@/security/PinModal';
import { notifyLocal } from '@/shared/utils/notifications';
import { formatCurrency } from '@/shared/utils/format';

export default function ProductDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { product } = route.params || {};
  const accounts = useAccountStore((s) => s.accounts);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const { purchaseProduct } = useProducts();

  const [accountId, setAccountId] = useState(accounts[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pinVisible, setPinVisible] = useState(false);

  const account = accounts.find((a) => a.id === accountId);
  const earnedPoints = Math.floor((product?.price || 0) / 10);

  const doPurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await purchaseProduct({ productId: product.id, accountId });
      await fetchAccounts();
      await notifyLocal(t('products.notifPurchaseTitle'), t('products.notifPurchaseBody', { name: product.name }));
      const receipt = {
        id: result?.transaction?._id || result?.transaction?.id,
        productName: product.name,
        amount: product.price,
        accountNumber: account?.accountNumber,
        earnedPoints: result?.earnedPoints ?? earnedPoints,
        date: new Date().toISOString(),
        reference: result?.transaction?.reference,
      };
      navigation.replace('PurchaseReceipt', { receipt });
    } catch (err) {
      setError(err?.response?.data?.message || t('common.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    setError(null);
    if (!accountId) {
      setError(t('products.validation.selectAccount'));
      return;
    }
    if (account && product && account.balance < product.price) {
      setError(t('products.validation.insufficient'));
      return;
    }
    const method = await getPreferredAuth();
    if (method === 'biometric') {
      const ok = await authenticateBiometric(t('transfers.confirmBiometric'));
      if (!ok) return;
      doPurchase();
    } else if (method === 'pin') {
      setPinVisible(true);
    } else {
      doPurchase();
    }
  };

  if (!product) {
    return (
      <View style={styles.screen}>
        <ErrorText>{t('common.errorGeneric')}</ErrorText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        <Divider />
        <Row label={t('products.price')} value={formatCurrency(product.price)} />
        <Row label={t('products.pointsEarned')} value={`+${earnedPoints}`} />
      </Card>

      <Text style={[styles.label, styles.spaced]}>{t('transfers.origin')}</Text>
      {accounts.map((acc) => (
        <SelectableRow
          key={acc.id}
          selected={accountId === acc.id}
          onPress={() => setAccountId(acc.id)}
          title={<MaskedNumber value={acc.accountNumber} />}
          right={<CurrencyText value={acc.balance} style={styles.rowBalance} />}
        />
      ))}

      <ErrorText>{error}</ErrorText>
      <Button title={t('products.confirmPurchase')} icon="shopping-cart" onPress={onConfirm} loading={loading} style={styles.confirmBtn} />

      <PinModal
        visible={pinVisible}
        mode="verify"
        title={t('security.enterPin')}
        onSuccess={() => {
          setPinVisible(false);
          doPurchase();
        }}
        onClose={() => setPinVisible(false)}
      />
    </ScrollView>
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

function SelectableRow({ selected, onPress, title, right }) {
  return (
    <Pressable onPress={onPress} style={[styles.selRow, selected && styles.selRowActive]}>
      <MaterialIcons
        name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={20}
        color={selected ? COLORS.primary : COLORS.outlineVariant}
      />
      <View style={styles.selRowTitle}>{title}</View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
  name: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: COLORS.text },
  description: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: COLORS.textLight, marginTop: SPACING.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
  rowLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: COLORS.textLight },
  rowValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: COLORS.text },
  label: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: COLORS.textVariant, marginBottom: SPACING.sm },
  spaced: { marginTop: SPACING.md },
  selRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  selRowActive: { borderColor: COLORS.primary },
  selRowTitle: { flex: 1 },
  rowBalance: { fontSize: FONT_SIZE.body, color: COLORS.textLight },
  confirmBtn: { marginTop: SPACING.md },
});
