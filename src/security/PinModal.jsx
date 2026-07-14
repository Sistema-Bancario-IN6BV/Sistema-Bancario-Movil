// src/security/PinModal.jsx
// Modal de PIN reutilizable. mode: 'verify' (comprobar) | 'set' (configurar).
import { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useSecurityStore } from '@/security/securityStore';

const PIN_LENGTH = 4;

export default function PinModal({ visible, mode = 'verify', title, onSuccess, onClose }) {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const verifyPin = useSecurityStore((s) => s.verifyPin);
  const setPin = useSecurityStore((s) => s.setPin);

  const [pin, setPinValue] = useState('');
  const [confirm, setConfirmValue] = useState('');
  const [step, setStep] = useState('enter');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setPinValue('');
    setConfirmValue('');
    setStep('enter');
    setError(null);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const submit = async () => {
    setError(null);
    if (pin.length !== PIN_LENGTH) {
      setError(t('security.pinLength'));
      return;
    }
    setBusy(true);
    try {
      if (mode === 'set') {
        if (step === 'enter') {
          setStep('confirm');
          setBusy(false);
          return;
        }
        if (confirm !== pin) {
          setError(t('security.pinMismatch'));
          setBusy(false);
          return;
        }
        await setPin(pin);
        reset();
        onSuccess?.();
      } else {
        const ok = await verifyPin(pin);
        if (!ok) {
          setError(t('security.pinIncorrect'));
          setPinValue('');
          setBusy(false);
          return;
        }
        reset();
        onSuccess?.();
      }
    } finally {
      setBusy(false);
    }
  };

  const isConfirmStep = mode === 'set' && step === 'confirm';
  const value = isConfirmStep ? confirm : pin;
  const onChange = (text) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    if (isConfirmStep) setConfirmValue(digits);
    else setPinValue(digits);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="lock" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>
            {title || (isConfirmStep ? t('security.confirmPin') : t('security.enterPin'))}
          </Text>
          <Input
            value={value}
            onChangeText={onChange}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={PIN_LENGTH}
            error={error}
          />
          <View style={styles.actions}>
            {onClose ? (
              <Button title={t('common.cancel')} variant="secondary" onPress={close} style={styles.flex} />
            ) : null}
            <Button title={t('common.confirm')} onPress={submit} loading={busy} style={styles.flex} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors, shadows) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: SPACING.lg },
    card: { backgroundColor: colors.surface, borderRadius: RADIUS.card, padding: SPACING.lg, ...shadows.ambient },
    iconWrap: { alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lightTealSurface, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text, textAlign: 'center', marginBottom: SPACING.md },
    actions: { flexDirection: 'row', gap: SPACING.sm },
    flex: { flex: 1 },
  });
}
