// src/features/transfers/screens/NewTransferScreen.jsx
import { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { useConfirm } from '@/shared/feedback/FeedbackProvider';
import { Card, CurrencyText, ErrorText, MaskedNumber } from '@/shared/components/common/Common';
import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { useAccountStore } from '@/shared/store/accountStore';
import { useTransferStore } from '@/shared/store/transferStore';
import { TRANSFER_RULES } from '@/shared/constants/endpoints';

const DEST_TYPES = ['favorite', 'new'];

export default function NewTransferScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const confirm = useConfirm();
  const accounts = useAccountStore((s) => s.accounts);
  const getById = useAccountStore((s) => s.getById);

  const store = useTransferStore();
  const [originId, setOriginId] = useState(store.originAccountId || accounts[0]?.id || null);
  const [destType, setDestType] = useState(store.destination?.type === 'new' ? 'new' : 'favorite');
  const [destNumber, setDestNumber] = useState(store.destination?.type === 'new' ? store.destination.accountNumber : '');
  const [amount, setAmount] = useState(store.amount || '');
  const [concept, setConcept] = useState(store.concept || '');
  const [error, setError] = useState(null);

  const favoriteDest = store.destination?.type === 'favorite' ? store.destination : null;
  const origin = getById(originId);

  // Aviso al salir con un borrador con monto sin enviar.
  useLayoutEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!amount) return;
      e.preventDefault();
      (async () => {
        const ok = await confirm({
          title: t('transfers.discardTitle'),
          message: t('transfers.discardBody'),
          confirmText: t('transfers.discard'),
          cancelText: t('common.cancel'),
          destructive: true,
        });
        if (ok) {
          store.clearDraft();
          navigation.dispatch(e.data.action);
        }
      })();
    });
    return unsub;
  }, [navigation, amount, store, t, confirm]);

  const validate = () => {
    if (!originId) return t('transfers.validation.selectOrigin');
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return t('transfers.validation.amountPositive');
    if (numeric > TRANSFER_RULES.MAX_PER_TRANSFER) return t('transfers.validation.maxPerTransfer');
    if (origin && numeric > origin.balance) return t('transfers.validation.insufficient');

    if (destType === 'new' && !destNumber.trim()) return t('transfers.validation.selectDestination');
    if (destType === 'favorite' && !favoriteDest) return t('transfers.validation.selectDestination');
    return null;
  };

  const onContinue = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    let destination;
    if (destType === 'new') {
      destination = { type: 'new', accountNumber: destNumber.trim() };
    } else {
      destination = favoriteDest;
    }

    store.setOrigin(originId);
    store.setDestination(destination);
    store.setAmount(String(amount));
    store.setConcept(concept);
    navigation.navigate('ConfirmTransfer');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Cuenta origen */}
      <Text style={styles.label}>{t('transfers.origin')}</Text>
      {accounts.map((acc) => (
        <SelectableRow
          key={acc.id}
          selected={originId === acc.id}
          onPress={() => setOriginId(acc.id)}
          title={<MaskedNumber value={acc.accountNumber} />}
          right={<CurrencyText value={acc.balance} style={styles.rowBalance} />}
        />
      ))}

      {/* Destino */}
      <Text style={[styles.label, styles.spaced]}>{t('transfers.destination')}</Text>
      <View style={styles.segment}>
        {DEST_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => setDestType(type)}
            style={[styles.segmentItem, destType === type && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, destType === type && styles.segmentTextActive]}>
              {t(`transfers.destination${type.charAt(0).toUpperCase()}${type.slice(1)}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {destType === 'favorite' ? (
        <Card style={styles.favBox} onPress={() => navigation.navigate('SelectFavorite')}>
          <View style={styles.favBoxRow}>
            <MaterialIcons name="star" size={20} color={colors.warning} />
            <View style={styles.flex}>
              {favoriteDest ? (
                <>
                  <Text style={styles.favBoxAlias}>{favoriteDest.alias}</Text>
                  <Text style={styles.favBoxNumber}>•••• {String(favoriteDest.accountNumber || '').slice(-4)}</Text>
                </>
              ) : (
                <Text style={styles.favBoxAlias}>{t('transfers.selectFavorite')}</Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.textLight} />
          </View>
        </Card>
      ) : null}

      {destType === 'new' ? (
        <Input
          label={t('transfers.destinationAccountNumber')}
          value={destNumber}
          onChangeText={setDestNumber}
          keyboardType="number-pad"
          leftIcon="account-balance"
        />
      ) : null}

      {/* Monto y concepto */}
      <View style={styles.spaced}>
        <Input
          label={t('transfers.amount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          leftIcon="payments"
          helper={t('transfers.validation.maxPerTransfer')}
        />
      </View>
      <Input
        label={t('transfers.concept')}
        value={concept}
        onChangeText={setConcept}
        placeholder={t('transfers.conceptPlaceholder')}
        autoCapitalize="sentences"
      />

      <ErrorText>{error}</ErrorText>
      <Button title={t('common.continue')} onPress={onContinue} style={styles.continueBtn} />
    </ScrollView>
  );
}

function SelectableRow({ selected, onPress, title, right }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={[styles.selRow, selected && styles.selRowActive]}>
      <MaterialIcons
        name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={20}
        color={selected ? colors.primary : colors.outlineVariant}
      />
      <View style={styles.selRowTitle}>{title}</View>
      {right}
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
    flex: { flex: 1 },
    label: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.textVariant, marginBottom: SPACING.sm },
    spaced: { marginTop: SPACING.md },
    selRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    selRowActive: { borderColor: colors.primary },
    selRowTitle: { flex: 1 },
    rowBalance: { fontSize: FONT_SIZE.body, color: colors.textLight },
    segment: { flexDirection: 'row', backgroundColor: colors.surfaceVariant, borderRadius: RADIUS.md, padding: 3, marginBottom: SPACING.md },
    segmentItem: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.sm },
    segmentActive: { backgroundColor: colors.surface },
    segmentText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.textLight },
    segmentTextActive: { color: colors.primary },
    favBox: { marginBottom: SPACING.sm },
    favBoxRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    favBoxAlias: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
    favBoxNumber: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight },
    continueBtn: { marginTop: SPACING.md },
  });
}
