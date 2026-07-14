// src/features/home/components/ConversionModal.jsx
// Conversión de saldo a otras divisas vía GET /accounts/convert-balance/:id?to=...
// (el backend usa una API externa de tipos de cambio).
import { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/common/Button';
import { CurrencyText } from '@/shared/components/common/Common';
import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useTheme } from '@/shared/theme/ThemeProvider';

const CURRENCIES = ['USD', 'EUR', 'MXN', 'GBP', 'JPY', 'CAD'];

export default function ConversionModal({ visible, onClose, accountId, convertBalance }) {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const [selected, setSelected] = useState(['USD', 'EUR']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggle = (cur) =>
    setSelected((prev) => (prev.includes(cur) ? prev.filter((c) => c !== cur) : [...prev, cur]));

  const onConvert = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await convertBalance(accountId, selected);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || t('common.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const converted = result?.saldoConvertido && typeof result.saldoConvertido === 'object' ? result.saldoConvertido : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('accounts.convertTitle')}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={colors.textLight} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>{t('accounts.convertSubtitle')}</Text>

          <Text style={styles.sectionLabel}>{t('accounts.selectCurrencies')}</Text>
          <View style={styles.chips}>
            {CURRENCIES.map((cur) => {
              const active = selected.includes(cur);
              return (
                <Pressable
                  key={cur}
                  onPress={() => toggle(cur)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cur}</Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: SPACING.md }} />
          ) : converted ? (
            <View style={styles.results}>
              <Text style={styles.sectionLabel}>{t('accounts.convertedBalance')}</Text>
              {Object.entries(converted).map(([cur, val]) => (
                <View key={cur} style={styles.resultRow}>
                  <Text style={styles.resultCur}>{cur}</Text>
                  <CurrencyText value={val} currency={cur} style={styles.resultVal} />
                </View>
              ))}
            </View>
          ) : null}

          <Button title={t('accounts.convert')} icon="currency-exchange" onPress={onConvert} loading={loading} style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors, shadows) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: RADIUS.card,
      borderTopRightRadius: RADIUS.card,
      padding: SPACING.lg,
      paddingBottom: SPACING.xl,
      ...shadows.ambient,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text },
    subtitle: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight, marginTop: SPACING.xs },
    sectionLabel: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.textVariant, marginTop: SPACING.md, marginBottom: SPACING.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.textVariant },
    chipTextActive: { color: colors.onPrimary },
    results: { marginTop: SPACING.md },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultCur: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.textVariant },
    resultVal: { fontSize: FONT_SIZE.body },
    error: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.error, marginTop: SPACING.sm },
    btn: { marginTop: SPACING.lg },
  });
}
