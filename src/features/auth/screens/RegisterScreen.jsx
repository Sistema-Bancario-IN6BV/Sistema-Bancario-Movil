// src/features/auth/screens/RegisterScreen.jsx
import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import { ScreenContainer, ErrorText } from '@/shared/components/common/Common';
import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';
import { useAlert } from '@/shared/feedback/FeedbackProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buildRules } from '@/features/auth/validation';
import AuthHeader from '@/features/auth/components/AuthHeader';

const STEP_FIELDS = [
  ['name', 'surname', 'username'],
  ['email', 'phone', 'dpi', 'address'],
  ['jobName', 'monthlyIncome'],
  ['password', 'confirmPassword'],
];
const TOTAL_STEPS = STEP_FIELDS.length;

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const alert = useAlert();
  const { handleRegister, loading, error } = useAuth();
  const rules = buildRules(t);
  const { control, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    defaultValues: {
      name: '', surname: '', username: '', email: '', password: '',
      confirmPassword: '', phone: '', dpi: '', address: '', jobName: '', monthlyIncome: '',
    },
  });
  const password = watch('password');

  const [step, setStep] = useState(0);
  const isLastStep = step === TOTAL_STEPS - 1;

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (values) => {
    const res = await handleRegister(values);
    if (res.ok) {
      await alert({ title: t('auth.registerSuccessTitle'), message: t('auth.registerSuccessBody'), confirmText: t('common.continue') });
      navigation.navigate('Login');
    }
  };

  const field = (name, label, extra = {}) => (
    <Controller
      control={control}
      name={name}
      rules={extra.rules}
      render={({ field: { value, onChange, onBlur } }) => (
        <Input
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={errors[name]?.message}
          {...extra.props}
        />
      )}
    />
  );

  const stepTitle = t(`auth.registerStep${step + 1}Title`);
  const stepSubtitle = t(`auth.registerStep${step + 1}Subtitle`);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenContainer scroll>
        <AuthHeader title={stepTitle} subtitle={stepSubtitle} compact />
        <StepProgress step={step} total={TOTAL_STEPS} />

        {step === 0 ? (
          <>
            {field('name', t('auth.name'), { rules: { required: t('common.required') }, props: { autoCapitalize: 'words' } })}
            {field('surname', t('auth.surname'), { rules: { required: t('common.required') }, props: { autoCapitalize: 'words' } })}
            {field('username', t('auth.username'), { rules: { required: t('common.required') } })}
          </>
        ) : null}

        {step === 1 ? (
          <>
            {field('email', t('auth.email'), { rules: rules.email, props: { keyboardType: 'email-address' } })}
            {field('phone', t('auth.phone'), { rules: rules.phone, props: { keyboardType: 'number-pad', maxLength: 8 } })}
            {field('dpi', t('auth.dpi'), { rules: rules.dpi, props: { keyboardType: 'number-pad', maxLength: 13 } })}
            {field('address', t('auth.address'), { rules: { required: t('common.required') }, props: { autoCapitalize: 'sentences' } })}
          </>
        ) : null}

        {step === 2 ? (
          <>
            {field('jobName', t('auth.jobName'), { props: { autoCapitalize: 'sentences' } })}
            {field('monthlyIncome', t('auth.monthlyIncome'), { rules: rules.income, props: { keyboardType: 'decimal-pad' } })}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Controller
              control={control}
              name="password"
              rules={rules.password}
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label={t('auth.password')} value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.password?.message} helper={t('auth.validation.passwordStrength')} />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              rules={{ required: t('common.required'), validate: (v) => v === password || t('auth.validation.passwordMatch') }}
              render={({ field: { value, onChange, onBlur } }) => (
                <Input label={t('auth.confirmPassword')} value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.confirmPassword?.message} />
              )}
            />
          </>
        ) : null}

        <ErrorText>{error}</ErrorText>

        <View style={styles.actions}>
          {step > 0 ? (
            <Button title={t('common.back')} variant="secondary" onPress={goBack} style={styles.flexBtn} />
          ) : null}
          {isLastStep ? (
            <Button title={t('auth.register')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.flexBtn} />
          ) : (
            <Button title={t('common.continue')} onPress={goNext} style={styles.flexBtn} />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.haveAccount')} </Text>
          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
            <Text style={styles.footerLink}>{t('auth.login')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

function StepProgress({ step, total }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.progressWrap}>
      <Text style={styles.progressLabel}>{t('auth.stepProgress', { current: step + 1, total })}</Text>
      <View style={styles.progressTrack}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.progressSegment, i <= step && styles.progressSegmentActive]} />
        ))}
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    progressWrap: { marginBottom: SPACING.md },
    progressLabel: { fontFamily: FONT.bold, fontSize: FONT_SIZE.label, color: colors.textVariant, marginBottom: SPACING.xs },
    progressTrack: { flexDirection: 'row', gap: SPACING.xs },
    progressSegment: { flex: 1, height: 4, borderRadius: RADIUS.full, backgroundColor: colors.border },
    progressSegmentActive: { backgroundColor: colors.primary },
    actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
    flexBtn: { flex: 1 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
    footerText: { fontFamily: FONT.regular, fontSize: FONT_SIZE.body, color: colors.textLight },
    footerLink: { fontFamily: FONT.bold, fontSize: FONT_SIZE.body, color: colors.secondary },
  });
}
