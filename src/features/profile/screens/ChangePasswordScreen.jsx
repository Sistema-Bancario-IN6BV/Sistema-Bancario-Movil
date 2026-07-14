// src/features/profile/screens/ChangePasswordScreen.jsx
import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { ScreenContainer, ErrorText } from '@/shared/components/common/Common';
import { SPACING } from '@/shared/constants/theme';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { buildRules } from '@/features/auth/validation';

export default function ChangePasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const { changePassword } = useProfile();
  const rules = buildRules(t);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = watch('newPassword');

  const onSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await changePassword(values);
      Alert.alert(t('common.success'), t('profile.passwordChanged'), [
        { text: t('common.continue'), onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || t('common.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Controller
        control={control}
        name="currentPassword"
        rules={{ required: t('common.required') }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('auth.currentPassword')} value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.currentPassword?.message} />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        rules={rules.password}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('auth.newPassword')} value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.newPassword?.message} helper={t('auth.validation.passwordStrength')} />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        rules={{ required: t('common.required'), validate: (v) => v === newPassword || t('auth.validation.passwordMatch') }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('auth.confirmPassword')} value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.confirmPassword?.message} />
        )}
      />
      <ErrorText>{error}</ErrorText>
      <Button title={t('common.save')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submit} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: SPACING.sm },
});
