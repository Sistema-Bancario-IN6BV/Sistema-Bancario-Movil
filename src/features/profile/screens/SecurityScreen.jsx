// src/features/profile/screens/SecurityScreen.jsx
import { useState, useEffect, useMemo } from 'react';
import { View, Text, Switch, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { Card, Divider } from '@/shared/components/common/Common';
import { useSecurityStore } from '@/security/securityStore';
import { biometricAvailable } from '@/security/biometric';
import PinModal from '@/security/PinModal';
import PasswordConfirmModal from '@/security/PasswordConfirmModal';
import { useThemeStore } from '@/shared/store/themeStore';
import i18n, { setAppLanguage } from '@/shared/i18n';

const APPEARANCE_OPTIONS = ['light', 'dark', 'system'];

export default function SecurityScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const biometricEnabled = useSecurityStore((s) => s.biometricEnabled);
  const hasPin = useSecurityStore((s) => s.hasPin);
  const setBiometricEnabled = useSecurityStore((s) => s.setBiometricEnabled);
  const load = useSecurityStore((s) => s.load);

  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const [available, setAvailable] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    load();
    biometricAvailable().then(setAvailable);
  }, [load]);

  const onToggleBiometric = async (value) => {
    if (value && !available) {
      Alert.alert(t('profile.security'), t('security.biometricUnavailable'));
      return;
    }
    await setBiometricEnabled(value);
  };

  const changeLanguage = async (lng) => {
    await setAppLanguage(lng);
    setLang(lng);
  };

  return (
    <View style={styles.screen}>
      {/* Biometría */}
      <Card>
        <View style={styles.row}>
          <View style={styles.rowIcon}><MaterialIcons name="fingerprint" size={22} color={colors.primary} /></View>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{t('profile.biometric')}</Text>
            <Text style={styles.rowHint}>{available ? t('profile.biometricHint') : t('security.biometricUnavailable')}</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={onToggleBiometric}
            trackColor={{ true: colors.secondaryContainer, false: colors.outlineVariant }}
            thumbColor={biometricEnabled ? colors.secondary : colors.surface}
          />
        </View>
      </Card>

      {/* PIN */}
      <Card style={styles.spaced}>
        <Pressable onPress={() => setPasswordVisible(true)} style={styles.row}>
          <View style={styles.rowIcon}><MaterialIcons name="pin" size={22} color={colors.primary} /></View>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{t('profile.pin')}</Text>
            <Text style={styles.rowHint}>{hasPin ? t('profile.changePin') : t('profile.setPin')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.textLight} />
        </Pressable>
      </Card>

      {/* Idioma */}
      <Card style={styles.spaced}>
        <Text style={styles.cardTitle}>{t('profile.language')}</Text>
        <Divider />
        <LangOption label={t('profile.spanish')} active={lang?.startsWith('es')} onPress={() => changeLanguage('es')} />
        <LangOption label={t('profile.english')} active={lang?.startsWith('en')} onPress={() => changeLanguage('en')} />
      </Card>

      {/* Apariencia */}
      <Card style={styles.spaced}>
        <Text style={styles.cardTitle}>{t('profile.appearance')}</Text>
        <Divider />
        {APPEARANCE_OPTIONS.map((option) => (
          <LangOption
            key={option}
            label={t(`profile.appearance${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
            active={themeMode === option}
            onPress={() => setThemeMode(option)}
          />
        ))}
      </Card>

      <PasswordConfirmModal
        visible={passwordVisible}
        onSuccess={() => {
          setPasswordVisible(false);
          setPinVisible(true);
        }}
        onClose={() => setPasswordVisible(false)}
      />

      <PinModal
        visible={pinVisible}
        mode="set"
        onSuccess={() => {
          setPinVisible(false);
          Alert.alert(t('common.success'), t('security.pinSaved'));
        }}
        onClose={() => setPinVisible(false)}
      />
    </View>
  );
}

function LangOption({ label, active, onPress }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={styles.langRow}>
      <Text style={styles.langLabel}>{label}</Text>
      <MaterialIcons
        name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={22}
        color={active ? colors.primary : colors.outlineVariant}
      />
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background, padding: SPACING.gutter },
    row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightTealSurface, alignItems: 'center', justifyContent: 'center' },
    flex: { flex: 1 },
    rowTitle: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
    rowHint: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, marginTop: 2 },
    spaced: { marginTop: SPACING.md },
    cardTitle: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.text },
    langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md },
    langLabel: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.text },
  });
}
