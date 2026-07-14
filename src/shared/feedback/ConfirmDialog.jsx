// src/shared/feedback/ConfirmDialog.jsx
// Presentacional puro (sin contexto propio) — montado por FeedbackProvider.
// Reemplaza Alert.alert con un modal que respeta el tema claro/oscuro.
// Mismo patrón visual que src/security/PinModal.jsx.
import { useMemo } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import Button from '@/shared/components/common/Button';
import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useTheme } from '@/shared/theme/ThemeProvider';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  onConfirm,
  onCancel,
}) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const hasCancel = cancelText != null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={hasCancel ? onCancel : undefined}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
            <MaterialIcons
              name={destructive ? 'warning' : 'check-circle'}
              size={28}
              color={destructive ? colors.error : colors.primary}
            />
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {hasCancel ? (
              <Button title={cancelText} variant="secondary" onPress={onCancel} style={styles.flex} />
            ) : null}
            <Button
              title={confirmText}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={styles.flex}
            />
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
    iconWrap: {
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.lightTealSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    iconWrapDanger: { backgroundColor: colors.errorContainer },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text, textAlign: 'center', marginBottom: SPACING.xs },
    message: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight, textAlign: 'center', marginBottom: SPACING.md },
    actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
    flex: { flex: 1 },
  });
}
