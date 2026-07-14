// src/features/auth/validation.js
// Reglas de validación reutilizables para react-hook-form en pantallas de auth.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mínimo 8, al menos 1 mayúscula, 1 número y 1 símbolo (más estricto que el backend).
export const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function buildRules(t) {
  return {
    required: { value: true, message: t('common.required') },
    email: {
      required: t('common.required'),
      pattern: { value: EMAIL_REGEX, message: t('auth.validation.emailInvalid') },
    },
    password: {
      required: t('common.required'),
      minLength: { value: 8, message: t('auth.validation.passwordMin') },
      pattern: { value: STRONG_PASSWORD_REGEX, message: t('auth.validation.passwordStrength') },
    },
    phone: {
      required: t('common.required'),
      pattern: { value: /^\d{8}$/, message: t('auth.validation.phoneDigits') },
    },
    dpi: {
      required: t('common.required'),
      pattern: { value: /^\d{13}$/, message: t('auth.validation.dpiDigits') },
    },
    income: {
      required: t('common.required'),
      validate: (v) => Number(v) >= 100 || t('auth.validation.incomeMin'),
    },
  };
}
