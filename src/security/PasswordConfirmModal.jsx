// src/security/PasswordConfirmModal.jsx
// Modal que exige reingresar la contraseña (verificada contra AuthService) antes
// de permitir configurar/cambiar el PIN de transacciones.
import { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function PasswordConfirmModal({ visible, onSuccess, onClose }) {
  const { t } = useTranslation();
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const { verifyPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setPassword('');
    setError(null);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const submit = async () => {
    setError(null);
    if (!password) {
      setError(t('common.required'));
      return;
    }
    setBusy(true);
    try {
      const res = await verifyPassword(password);
      if (!res.ok) {
        setError(t('security.incorrectPassword'));
        return;
      }
      reset();
      onSuccess?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="lock-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('security.confirmPasswordTitle')}</Text>
          <Text style={styles.hint}>{t('security.confirmPasswordHint')}</Text>
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={error}
          />
          <View style={styles.actions}>
            <Button title={t('common.cancel')} variant="secondary" onPress={close} style={styles.flex} />
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
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text, textAlign: 'center', marginBottom: SPACING.xs },
    hint: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, textAlign: 'center', marginBottom: SPACING.md },
    actions: { flexDirection: 'row', gap: SPACING.sm },
    flex: { flex: 1 },
  });
}
