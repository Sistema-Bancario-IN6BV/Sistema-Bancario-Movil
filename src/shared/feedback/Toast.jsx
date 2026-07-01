// src/shared/feedback/Toast.jsx
// Presentacional puro — montado por FeedbackProvider. Banner inferior
// no bloqueante con auto-dismiss, anima entrada/salida con Animated (sin
// librerías nuevas). Reemplaza los Alert.alert de "éxito sin acción posterior".
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useTheme } from '@/shared/theme/ThemeProvider';

// Mismo pareo de colores que BADGE_VARIANTS en shared/components/common/Common.jsx,
// para mantener consistencia visual con los badges de estado ya existentes.
const VARIANTS = {
  success: { icon: 'check-circle', fgKey: 'success', bgKey: 'successSurface' },
  error: { icon: 'error', fgKey: 'onErrorContainer', bgKey: 'errorContainer' },
  warning: { icon: 'warning', fgKey: 'onWarning', bgKey: 'warningSurface' },
  info: { icon: 'info', fgKey: 'secondary', bgKey: 'lightTealSurface' },
};

export default function Toast({ visible, message, variant = 'info' }) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, shadows, insets), [colors, shadows, insets]);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  const v = VARIANTS[variant] || VARIANTS.info;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { backgroundColor: colors[v.bgKey], opacity: progress, transform: [{ translateY }] },
      ]}
    >
      <MaterialIcons name={v.icon} size={20} color={colors[v.fgKey]} style={styles.icon} />
      <Text style={[styles.text, { color: colors[v.fgKey] }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

function createStyles(colors, shadows, insets) {
  return StyleSheet.create({
    toast: {
      position: 'absolute',
      left: SPACING.gutter,
      right: SPACING.gutter,
      bottom: insets.bottom + SPACING.lg,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.sm + 2,
      paddingHorizontal: SPACING.md,
      ...shadows.ambient,
    },
    icon: { marginRight: SPACING.sm },
    text: { flex: 1, fontFamily: FONT.bold, fontSize: FONT_SIZE.label },
  });
}
