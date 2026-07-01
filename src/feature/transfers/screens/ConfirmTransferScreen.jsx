// src/features/transfers/screens/ConfirmTransferScreen.jsx
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { Card, CurrencyText, Divider, ErrorText } from '@/shared/components/common/Common';
import Button from '@/shared/components/common/Button';
import { useTransferStore } from '@/shared/store/transferStore';
import { useAccountStore } from '@/shared/store/accountStore';
import { useTransfers } from '@/features/transfers/hooks/useTransfers';
import { getPreferredAuth, authenticateBiometric } from '@/security/biometric';
import PinModal from '@/security/PinModal';
import { notifyLocal } from '@/shared/utils/notifications';
import { formatCurrency } from '@/shared/utils/format';

export default function ConfirmTransferScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const store = useTransferStore();
  const getById = useAccountStore((s) => s.getById);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const { createTransfer, fastTransfer } = useTransfers();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pinVisible, setPinVisible] = useState(false);

  const origin = getById(store.originAccountId);
  const destination = store.destination;
  const amount = Number(store.amount);

  const destLabel =
    destination?.type === 'favorite'
      ? destination.alias
      : `•••• ${String(destination?.accountNumber || '').slice(-4)}`;

  const doTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (destination.type === 'favorite' && destination.favoriteId) {
        result = await fastTransfer({
          favoriteId: destination.favoriteId,
          sourceAccount: store.originAccountId,
          amount,
        });
      } else {
        result = await createTransfer({
          sourceAccount: store.originAccountId,
          destinationAccount: destination.accountNumber,
          amount,
          description: store.concept,
        });
      }
      await fetchAccounts();
      await notifyLocal(t('security.notifTransferTitle'), t('security.notifTransferBody', { amount: formatCurrency(amount) }));
      const receipt = {
        id: result?.transaction?._id || result?.transaction?.id,
        amount,
        concept: store.concept,
        originNumber: origin?.accountNumber,
        destinationLabel: destLabel,
        date: new Date().toISOString(),
        reference: result?.transaction?.reference || result?.reference,
      };
      store.clearDraft();
      navigation.navigate('TransferReceipt', { receipt });
    } catch (err) {
      setError(err?.response?.data?.message || t('common.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    setError(null);
    const method = await getPreferredAuth();
    if (method === 'biometric') {
      const ok = await authenticateBiometric(t('transfers.confirmBiometric'));
      if (!ok) return;
      doTransfer();
    } else if (method === 'pin') {
      setPinVisible(true);
    } else {
      doTransfer();
    }
  };

  if (!destination || !origin) {
    return (
      <View style={styles.screen}>
        <ErrorText>{t('common.errorGeneric')}</ErrorText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Card>
        <Text style={styles.summaryTitle}>{t('transfers.summary')}</Text>
        <CurrencyText value={amount} style={styles.amount} />
        <Divider />
        <Row label={t('transfers.origin')} value={`•••• ${String(origin.accountNumber || '').slice(-4)}`} />
        <Row label={t('transfers.destination')} value={destLabel} />
        {store.concept ? <Row label={t('transfers.concept')} value={store.concept} /> : null}
        <Row label={t('transfers.commission')} value={formatCurrency(0)} />
      </Card>

      <Text style={styles.bioHint}>{t('transfers.confirmBiometric')}</Text>
      <ErrorText>{error}</ErrorText>

      <Button title={t('transfers.confirmTransfer')} icon="check-circle" onPress={onConfirm} loading={loading} style={styles.confirmBtn} />

      <PinModal
        visible={pinVisible}
        mode="verify"
        title={t('security.enterPin')}
        onSuccess={() => {
          setPinVisible(false);
          doTransfer();
        }}
        onClose={() => setPinVisible(false)}
      />
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
    summaryTitle: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight },
    amount: { fontFamily: FONT.bold, fontSize: FONT_SIZE.display, color: colors.primary, marginVertical: SPACING.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm + 2 },
    rowLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight },
    rowValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text, maxWidth: '60%', textAlign: 'right' },
    bioHint: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, textAlign: 'center', marginTop: SPACING.lg },
    confirmBtn: { marginTop: SPACING.sm },
  });
}
