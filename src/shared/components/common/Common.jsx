// src/shared/components/common/Common.jsx
// Componentes compartidos reutilizables: LoadingSpinner, EmptyState, Card, Badge,
// CurrencyText, MaskedNumber, SectionTitle, Divider, ScreenContainer.
import { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors, useTheme } from '@/shared/theme/ThemeProvider';
import { formatCurrency, maskAccountNumber } from '@/shared/utils/format';

export function LoadingSpinner({ fullscreen = false, color }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.spinner, fullscreen && styles.spinnerFull]}>
      <ActivityIndicator size="large" color={color || colors.primary} />
    </View>
  );
}

export function EmptyState({ icon = 'inbox', title, message }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.empty}>
      <MaterialIcons name={icon} size={48} color={colors.outlineVariant} />
      <Text style={styles.emptyTitle}>{title || t('common.emptyTitle')}</Text>
      <Text style={styles.emptyMessage}>{message || t('common.emptyDefault')}</Text>
    </View>
  );
}

export function Card({ children, style, onPress, ...rest }) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }) => [styles.card, onPress && pressed && styles.cardPressed, style]}
      {...rest}
    >
      {children}
    </Wrapper>
  );
}

// Mapeo de estados de transacción a variante de color.
const STATUS_VARIANT = {
  COMPLETED: 'success',
  COMPLETADA: 'success',
  PENDING: 'warning',
  PENDIENTE: 'warning',
  FAILED: 'error',
  RECHAZADA: 'error',
};

function getBadgeVariants(colors) {
  return {
    success: { bg: colors.successSurface, fg: colors.success },
    warning: { bg: colors.warningSurface, fg: colors.onWarning },
    error: { bg: colors.errorContainer, fg: colors.onErrorContainer },
    neutral: { bg: colors.lightTealSurface, fg: colors.secondary },
  };
}

export function Badge({ label, status, variant }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const badgeVariants = useMemo(() => getBadgeVariants(colors), [colors]);
  const key = variant || STATUS_VARIANT[String(status || '').toUpperCase()] || 'neutral';
  const v = badgeVariants[key] || badgeVariants.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.badgeText, { color: v.fg }]}>{label}</Text>
    </View>
  );
}

export function CurrencyText({ value, currency = 'GTQ', hidden = false, style, signed }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const text = useMemo(() => {
    if (hidden) return '••••••';
    const base = formatCurrency(Math.abs(Number(value) || 0), currency);
    if (!signed) return base;
    const n = Number(value) || 0;
    return `${n < 0 ? '-' : '+'} ${base}`;
  }, [value, currency, hidden, signed]);
  return <Text style={[styles.currency, style]}>{text}</Text>;
}

export function MaskedNumber({ value, visible: showFull = false, digits = 4, style }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const text = showFull ? String(value ?? '') : maskAccountNumber(value, digits);
  return <Text style={[styles.masked, style]}>{text}</Text>;
}

export function SectionTitle({ children, action, onAction }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Divider({ style }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.divider, style]} />;
}

// Contenedor estándar de pantalla con scroll opcional.
export function ScreenContainer({ children, scroll = false, contentStyle, ...rest }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.screenContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.screen, styles.screenContent, contentStyle]}>{children}</View>;
}

export function ErrorText({ children }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!children) return null;
  return <Text style={styles.errorText}>{children}</Text>;
}

function createStyles(colors, shadows) {
  return StyleSheet.create({
    spinner: { paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
    spinnerFull: { flex: 1, backgroundColor: colors.background },
    empty: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.sm },
    emptyTitle: {
      fontFamily: FONT.bold,
      fontSize: FONT_SIZE.bodyLg,
      color: colors.text,
      marginTop: SPACING.sm,
    },
    emptyMessage: {
      fontFamily: FONT.regular,
      fontSize: FONT_SIZE.body,
      color: colors.textLight,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.md,
      ...(shadows ? shadows.card : null),
    },
    cardPressed: { opacity: 0.85 },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.sm + 2,
      paddingVertical: 3,
    },
    badgeText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.caption, letterSpacing: 0.3 },
    currency: { fontFamily: FONT.bold, fontSize: FONT_SIZE.bodyLg, color: colors.text },
    masked: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textVariant, letterSpacing: 1 },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
      marginTop: SPACING.md,
    },
    sectionTitle: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text },
    sectionAction: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.secondary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: SPACING.sm },
    screen: { flex: 1, backgroundColor: colors.background },
    screenContent: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
    errorText: {
      fontFamily: FONT.regular,
      fontSize: FONT_SIZE.label,
      color: colors.error,
      marginTop: SPACING.xs,
    },
  });
}
