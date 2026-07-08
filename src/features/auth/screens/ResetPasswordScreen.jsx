// src/features/auth/screens/ResetPasswordScreen.jsx
import { StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { ScreenContainer, ErrorText } from '@/shared/components/common/Common';
import { SPACING } from '@/shared/constants/theme';
import { useAlert } from '@/shared/feedback/FeedbackProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buildRules } from '@/features/auth/validation';
import AuthHeader from '@/features/auth/components/AuthHeader';

export default function ResetPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const alert = useAlert();
  const { handleResetPassword, loading, error } = useAuth();
  const rules = buildRules(t);
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = watch('newPassword');

  const onSubmit = async (values) => {
    const res = await handleResetPassword({ token: values.token, newPassword: values.newPassword });
    if (res.ok) {
      await alert({ title: t('common.success'), message: t('auth.resetSuccess'), confirmText: t('auth.login') });
      navigation.navigate('Login');
    }
  };

  return (
    <ScreenContainer scroll>
      <AuthHeader title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')} />
      <Controller
        control={control}
        name="token"
        rules={{ required: t('common.required') }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('auth.token')} value={value} onChangeText={onChange} onBlur={onBlur} leftIcon="vpn-key" error={errors.token?.message} />
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
      <Button title={t('common.confirm')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submit} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: SPACING.sm },
});
