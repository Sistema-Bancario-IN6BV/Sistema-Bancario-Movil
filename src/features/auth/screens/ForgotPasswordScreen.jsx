// src/features/auth/screens/ForgotPasswordScreen.jsx
import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { ScreenContainer, ErrorText } from '@/shared/components/common/Common';
import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { useAlert } from '@/shared/feedback/FeedbackProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buildRules } from '@/features/auth/validation';
import AuthHeader from '@/features/auth/components/AuthHeader';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const alert = useAlert();
  const { handleForgotPassword, loading, error } = useAuth();
  const rules = buildRules(t);
  const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    const res = await handleForgotPassword(values);
    if (res.ok) {
      await alert({ title: t('common.success'), message: t('auth.forgotSuccess'), confirmText: t('common.continue') });
      navigation.navigate('ResetPassword');
    }
  };

  return (
    <ScreenContainer scroll>
      <AuthHeader title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')} />
      <Controller
        control={control}
        name="email"
        rules={rules.email}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('auth.email')} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address" leftIcon="mail" error={errors.email?.message} />
        )}
      />
      <ErrorText>{error}</ErrorText>
      <Button title={t('auth.sendLink')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submit} />
      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('ResetPassword')} hitSlop={8}>
          <Text style={styles.footerLink}>{t('auth.resetTitle')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    submit: { marginTop: SPACING.sm },
    footer: { alignItems: 'center', marginTop: SPACING.lg },
    footerLink: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.secondary },
  });
}
