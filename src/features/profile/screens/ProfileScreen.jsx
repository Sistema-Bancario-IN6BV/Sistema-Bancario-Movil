// src/features/profile/screens/ProfileScreen.jsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { COLORS, SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { Card, LoadingSpinner, Divider, ErrorText } from '@/shared/components/common/Common';
import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { useAuthStore } from '@/shared/store/authStore';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { getInitials } from '@/shared/utils/format';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile, loading, error, updateClientProfile } = useProfile();
  const logout = useAuthStore((s) => s.logout);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', surname: '', address: '', jobName: '', monthlyIncome: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        surname: profile.surname || '',
        address: profile.address || '',
        jobName: profile.jobName || '',
        monthlyIncome: profile.monthlyIncome != null ? String(profile.monthlyIncome) : '',
      });
    }
  }, [profile, reset]);

  const onSave = async (values) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateClientProfile(values);
      setEditing(false);
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (err) {
      setSaveError(err?.response?.data?.message || t('common.errorGeneric'));
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading && !profile) return <LoadingSpinner fullscreen />;

  const avatarUri = profile?.profilePicture && String(profile.profilePicture).startsWith('http')
    ? profile.profilePicture
    : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Encabezado */}
      <View style={styles.header}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{getInitials(profile?.name, profile?.surname)}</Text>
          </View>
        )}
        <Text style={styles.name}>{profile?.name} {profile?.surname}</Text>
        <Text style={styles.username}>@{profile?.username}</Text>
      </View>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {/* Información personal */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('profile.personalInfo')}</Text>
          {!editing ? (
            <Pressable onPress={() => setEditing(true)} hitSlop={8} style={styles.editBtn}>
              <MaterialIcons name="edit" size={18} color={COLORS.secondary} />
              <Text style={styles.editText}>{t('common.edit')}</Text>
            </Pressable>
          ) : null}
        </View>

        {editing ? (
          <>
            <EditField control={control} name="name" label={t('profile.fields.name')} error={errors.name} rules={{ required: t('common.required') }} autoCapitalize="words" />
            <EditField control={control} name="surname" label={t('profile.fields.surname')} error={errors.surname} rules={{ required: t('common.required') }} autoCapitalize="words" />
            <EditField control={control} name="address" label={t('profile.fields.address')} error={errors.address} rules={{ required: t('common.required') }} autoCapitalize="sentences" />
            <EditField control={control} name="jobName" label={t('profile.fields.jobName')} autoCapitalize="sentences" />
            <EditField
              control={control}
              name="monthlyIncome"
              label={t('profile.fields.monthlyIncome')}
              error={errors.monthlyIncome}
              rules={{ required: t('common.required'), validate: (v) => Number(v) >= 100 || t('auth.validation.incomeMin') }}
              keyboardType="decimal-pad"
            />
            <ErrorText>{saveError}</ErrorText>
            <View style={styles.editActions}>
              <Button title={t('common.cancel')} variant="secondary" onPress={() => { setEditing(false); setSaveError(null); }} style={styles.flex} />
              <Button title={t('common.save')} onPress={handleSubmit(onSave)} loading={saving} style={styles.flex} />
            </View>
          </>
        ) : (
          <>
            <ReadRow label={t('profile.fields.name')} value={`${profile?.name || ''} ${profile?.surname || ''}`} />
            <ReadRow label={t('profile.fields.address')} value={profile?.address} />
            <ReadRow label={t('profile.fields.jobName')} value={profile?.jobName} />
            <ReadRow label={t('profile.fields.monthlyIncome')} value={profile?.monthlyIncome != null ? `Q ${Number(profile.monthlyIncome).toFixed(2)}` : ''} />
          </>
        )}
      </Card>

      {/* Datos solo de administrador */}
      <Card style={styles.spaced}>
        <Text style={styles.cardTitle}>{t('profile.readonlyNote')}</Text>
        <Divider />
        <ReadRow label={t('profile.fields.username')} value={profile?.username} />
        <ReadRow label={t('profile.fields.email')} value={profile?.email} />
        <ReadRow label={t('profile.fields.phone')} value={profile?.phone} />
        <ReadRow label={t('profile.fields.dpi')} value={profile?.dpi} />
      </Card>

      {/* Seguridad */}
      <Card style={styles.spaced}>
        <Text style={styles.cardTitle}>{t('profile.security')}</Text>
        <Divider />
        <LinkRow icon="lock" label={t('profile.changePassword')} onPress={() => navigation.navigate('ChangePassword')} />
        <LinkRow icon="security" label={t('profile.security')} onPress={() => navigation.navigate('Security')} />
      </Card>

      <Button title={t('profile.logout')} icon="logout" variant="secondary" onPress={confirmLogout} style={styles.logout} />
    </ScrollView>
  );
}

function EditField({ control, name, label, error, rules, ...props }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange, onBlur } }) => (
        <Input label={label} value={value} onChangeText={onChange} onBlur={onBlur} error={error?.message} {...props} />
      )}
    />
  );
}

function ReadRow({ label, value }) {
  return (
    <View style={styles.readRow}>
      <Text style={styles.readLabel}>{label}</Text>
      <Text style={styles.readValue}>{value || '—'}</Text>
    </View>
  );
}

function LinkRow({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
      <MaterialIcons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.linkLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.gutter, paddingBottom: SPACING.xl },
  header: { alignItems: 'center', marginBottom: SPACING.lg },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontFamily: FONT.bold, fontSize: FONT_SIZE.headline, color: COLORS.onPrimary },
  name: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: COLORS.text, marginTop: SPACING.sm },
  username: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: COLORS.textLight },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardTitle: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: COLORS.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: COLORS.secondary },
  editActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  flex: { flex: 1 },
  spaced: { marginTop: SPACING.md },
  readRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  readLabel: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: COLORS.textLight },
  readValue: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  pressed: { opacity: 0.7 },
  linkLabel: { flex: 1, fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: COLORS.text },
  logout: { marginTop: SPACING.lg },
});
