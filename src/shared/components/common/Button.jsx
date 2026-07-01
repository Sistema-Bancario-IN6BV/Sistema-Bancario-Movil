// src/shared/components/common/Button.jsx
import { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';

// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  pill = false,
}) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(), []);
  const variants = useMemo(() => getVariants(colors), [colors]);
  const isDisabled = disabled || loading;
  const palette = variants[variant] || variants.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        pill && styles.pill,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <MaterialIcons name={icon} size={18} color={palette.fg} /> : null}
          <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

function getVariants(colors) {
  return {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.primary, border: colors.border },
    ghost: { bg: colors.transparent, fg: colors.secondary, border: colors.transparent },
    danger: { bg: colors.errorContainer, fg: colors.onErrorContainer, border: colors.errorContainer },
  };
}

function createStyles() {
  return StyleSheet.create({
    base: {
      minHeight: 50,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.md,
    },
    pill: { borderRadius: RADIUS.pill },
    content: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    label: { fontFamily: FONT.bold, fontSize: FONT_SIZE.bodyLg },
    pressed: { opacity: 0.88 },
    disabled: { opacity: 0.5 },
  });
}
