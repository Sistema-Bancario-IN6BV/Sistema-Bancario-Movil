// src/shared/constants/endpoints.js
// Bases de los DOS backends reales del monorepo (ver CLAUDE.md):
//   - AuthService (.NET / identidad):  http://localhost:5127/api/v1
//   - Bank API   (Node / banca):       http://localhost:3006/bankSystem/v1
// Los puertos 3001-3004 del prompt original NO existen.

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:5127/api/v1';
const BANK_BASE = process.env.EXPO_PUBLIC_BANK_URL || 'http://localhost:3006/bankSystem/v1';

export const ENDPOINTS = {
  AUTH_BASE,
  BANK_BASE,

  // ----- AuthService (/api/v1) -----
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    PROFILE: '/auth/profile',
    CLIENT_PROFILE: '/auth/client-profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // ----- Bank API (/bankSystem/v1) -----
  ACCOUNTS: {
    ME: '/accounts/me',
    SUMMARY: '/accounts/me/summary',
    REQUEST: '/accounts/requests',
    REQUESTS_ME: '/accounts/requests/me',
    DETAIL: (id) => `/accounts/detail/${id}`,
    LOOKUP: (accountNumber) => `/accounts/lookup/${accountNumber}`,
    CONVERT: (id) => `/accounts/convert-balance/${id}`,
    PURCHASE_WITH_POINTS: '/accounts/purchase-with-points',
  },
  TRANSACTIONS: {
    CREATE: '/transactions/create',
    MY: '/transactions/my',
    REVERT: (id) => `/transactions/revert/${id}`,
  },
  FAVORITES: {
    LIST: '/favorites',
    CREATE: '/favorites/create',
    UPDATE: (id) => `/favorites/update/${id}`,
    DELETE: (id) => `/favorites/delete/${id}`,
    FAST_TRANSFER: '/favorites/fastTransfer',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    PURCHASE: '/products/purchase',
    HISTORY: (accountId) => `/products/purchase/${accountId}`,
  },
};

// Rutas de auth donde NO se debe forzar logout/redirect automático en 401:
// son flujos previos a tener sesión.
export const AUTH_PUBLIC_PATHS = [
  ENDPOINTS.AUTH.LOGIN,
  ENDPOINTS.AUTH.REGISTER,
  ENDPOINTS.AUTH.FORGOT_PASSWORD,
  ENDPOINTS.AUTH.RESET_PASSWORD,
  ENDPOINTS.AUTH.VERIFY_EMAIL,
  ENDPOINTS.AUTH.RESEND_VERIFICATION,
];

// Reglas de negocio del backend (espejadas para validación temprana en cliente).
export const TRANSFER_RULES = {
  MAX_PER_TRANSFER: 2000,
  DAILY_LIMIT: 10000,
};

export const PROFILE_RULES = {
  MIN_MONTHLY_INCOME: 100,
};

export default ENDPOINTS;
