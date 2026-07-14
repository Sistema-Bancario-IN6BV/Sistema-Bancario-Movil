// src/features/auth/screens/LoginScreen.jsx
import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { ScreenContainer, ErrorText } from '@/shared/components/common/Common';
import { SPACING, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuthHeader from '@/features/auth/components/AuthHeader';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { handleLogin, loading, error } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { emailOrUsername: '', password: '' },
  });

  const onSubmit = (values) => handleLogin(values);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContainer scroll contentStyle={styles.centeredContent}>
        <AuthHeader title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')} />

        <Controller
          control={control}
          name="emailOrUsername"
          rules={{ required: t('common.required') }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t('auth.emailOrUsername')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              leftIcon="person"
              error={errors.emailOrUsername?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: t('common.required') }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t('auth.password')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              leftIcon="lock"
              error={errors.password?.message}
            />
          )}
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
          <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
        </Pressable>

        <ErrorText>{error}</ErrorText>

        <Button title={t('auth.login')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submit} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
          <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
            <Text style={styles.footerLink}>{t('auth.register')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    centeredContent: { flexGrow: 1, justifyContent: 'center' },
    link: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.secondary, alignSelf: 'flex-end', marginBottom: SPACING.md },
    submit: { marginTop: SPACING.sm },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
    footerText: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight },
    footerLink: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.secondary },
  });
}
