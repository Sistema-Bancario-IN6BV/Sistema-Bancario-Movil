// src/security/AppLock.jsx
// Bloqueo de la app con biométrico/PIN. Se activa al abrir y al volver de segundo
// plano, solo si el usuario está autenticado y configuró biométrico o PIN.
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, AppState, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import Button from '@/shared/components/common/Button';
import { useAuthStore } from '@/shared/store/authStore';
import { useSecurityStore } from '@/security/securityStore';
import { biometricAvailable, authenticateBiometric } from '@/security/biometric';
import PinModal from '@/security/PinModal';
import { configureNotifications } from '@/shared/utils/notifications';

export default function AppLock({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const biometricEnabled = useSecurityStore((s) => s.biometricEnabled);
  const hasPin = useSecurityStore((s) => s.hasPin);
  const loadSecurity = useSecurityStore((s) => s.load);

  const [locked, setLocked] = useState(false);

  const lockEnabled = isAuthenticated && (biometricEnabled || hasPin);
  const stateRef = useRef({ lockEnabled });
  stateRef.current = { lockEnabled };

  useEffect(() => {
    configureNotifications();
    loadSecurity();
  }, [loadSecurity]);

  // Bloquear al autenticarse / configurar seguridad.
  useEffect(() => {
    if (hasHydrated && lockEnabled) setLocked(true);
  }, [hasHydrated, lockEnabled]);

  // Re-bloquear al volver de segundo plano.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && stateRef.current.lockEnabled) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  if (locked && lockEnabled) {
    return <LockScreen onUnlock={() => setLocked(false)} biometricEnabled={biometricEnabled} hasPin={hasPin} />;
  }

  return children;
}

function LockScreen({ onUnlock, biometricEnabled, hasPin }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [pinVisible, setPinVisible] = useState(false);
  const [available, setAvailable] = useState(false);

  const tryBiometric = useCallback(async () => {
    const ok = await authenticateBiometric(t('security.lockSubtitle'));
    if (ok) onUnlock();
  }, [onUnlock, t]);

  useEffect(() => {
    let active = true;
    biometricAvailable().then((avail) => {
      if (!active) return;
      setAvailable(avail);
      if (biometricEnabled && avail) {
        tryBiometric();
      } else if (!hasPin) {
        // Sin biométrico disponible ni PIN configurado: no podemos bloquear.
        onUnlock();
      } else {
        setPinVisible(true);
      }
    });
    return () => {
      active = false;
    };
  }, [biometricEnabled, hasPin, onUnlock, tryBiometric]);

  const canBiometric = biometricEnabled && available;

  return (
    <View style={styles.lock}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="lock" size={40} color={colors.onPrimary} />
      </View>
      <Text style={styles.title}>{t('security.lockTitle')}</Text>
      <Text style={styles.subtitle}>{t('security.lockSubtitle')}</Text>

      <View style={styles.actions}>
        {canBiometric ? (
          <Button title={t('security.useBiometric')} icon="fingerprint" onPress={tryBiometric} style={styles.btn} />
        ) : null}
        {hasPin ? (
          <Button
            title={t('security.enterPin')}
            icon="pin"
            variant={canBiometric ? 'secondary' : 'primary'}
            onPress={() => setPinVisible(true)}
            style={styles.btn}
          />
        ) : null}
      </View>

      <PinModal visible={pinVisible} mode="verify" onSuccess={() => { setPinVisible(false); onUnlock(); }} onClose={() => setPinVisible(false)} />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    lock: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    iconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
    title: { fontFamily: FONT.bold, fontSize: FONT_SIZE.headline, color: colors.text },
    subtitle: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight, marginTop: SPACING.xs, textAlign: 'center' },
    actions: { width: '100%', marginTop: SPACING.xl, gap: SPACING.sm },
    btn: { width: '100%' },
  });
}
