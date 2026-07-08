// src/features/auth/components/AuthHeader.jsx
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';

export default function AuthHeader({ title, subtitle, compact = false }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.wrapper, compact && styles.compact]}>
      <View style={styles.logo}>
        <MaterialIcons name="account-balance" size={32} color={colors.onPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.lg },
    compact: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.headline, color: colors.text, textAlign: 'center' },
    subtitle: {
      fontFamily: FONT.regular,
      fontSize: FONT_SIZE.body,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: SPACING.xs,
    },
  });
}
