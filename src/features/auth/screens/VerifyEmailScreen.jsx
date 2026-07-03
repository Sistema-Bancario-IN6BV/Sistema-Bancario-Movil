// src/features/auth/screens/VerifyEmailScreen.jsx
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

export default function VerifyEmailScreen({ navigation }) {
  const { t } = useTranslation();
  const alert = useAlert();
  const { handleResendVerification, loading, error } = useAuth();
  const rules = buildRules(t);
  const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    const res = await handleResendVerification(values);
    if (res.ok) {
      await alert({ title: t('common.success'), message: t('auth.resendSuccess'), confirmText: t('auth.login') });
      navigation.navigate('Login');
    }
  };

  return (
    <ScreenContainer scroll>
      <AuthHeader title={t('auth.verifyTitle')} subtitle={t('auth.verifyBody')} />
      <Controller
        control={control}
        name="email"
        rules={rules.email}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('auth.email')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address" leftIcon="mail" error={errors.email?.message} />
        )}
      />
      <ErrorText>{error}</ErrorText>
      <Button title={t('auth.resendVerification')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submit} />
      <Button title={t('auth.login')} variant="secondary" onPress={() => navigation.navigate('Login')} style={styles.secondary} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: SPACING.sm },
  secondary: { marginTop: SPACING.sm },
});
