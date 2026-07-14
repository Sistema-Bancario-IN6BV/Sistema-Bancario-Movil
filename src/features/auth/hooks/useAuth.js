// src/features/auth/hooks/useAuth.js
import { useState, useCallback } from 'react';

import authClient from '@/shared/api/authClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { useAuthStore } from '@/shared/store/authStore';

function readError(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginToStore = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const handleLogin = useCallback(
    async ({ emailOrUsername, password }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await authClient.post(ENDPOINTS.AUTH.LOGIN, { emailOrUsername, password });
        const token = data?.token;
        const userDetails = data?.userDetails || {};
        if (!token) throw new Error('Token no recibido');
        await loginToStore(token, {
          id: userDetails.id,
          username: userDetails.username,
          profilePicture: userDetails.profilePicture,
          role: userDetails.role,
        });
        return { ok: true };
      } catch (err) {
        const msg = readError(err, 'No pudimos iniciar sesión. Verifica tus credenciales.');
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [loginToStore],
  );

  const handleRegister = useCallback(async (values) => {
    setLoading(true);
    setError(null);
    try {
      // AuthService /register espera multipart/form-data (para la imagen de perfil).
      const form = new FormData();
      form.append('name', values.name);
      form.append('surname', values.surname);
      form.append('username', values.username);
      form.append('email', values.email);
      form.append('password', values.password);
      form.append('phone', values.phone);
      form.append('dpi', values.dpi);
      form.append('address', values.address);
      form.append('jobName', values.jobName || '');
      form.append('monthlyIncome', String(values.monthlyIncome));

      await authClient.post(ENDPOINTS.AUTH.REGISTER, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { ok: true };
    } catch (err) {
      const msg = readError(err, 'No pudimos crear tu cuenta.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(async ({ email }) => {
    setLoading(true);
    setError(null);
    try {
      await authClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return { ok: true };
    } catch (err) {
      const msg = readError(err, 'No pudimos procesar la solicitud.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetPassword = useCallback(async ({ token, newPassword }) => {
    setLoading(true);
    setError(null);
    try {
      await authClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
      return { ok: true };
    } catch (err) {
      const msg = readError(err, 'No pudimos restablecer la contraseña.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reverifica la identidad del usuario actual reutilizando /auth/login con su
  // username ya guardado. No toca authStore: la sesión vigente no cambia.
  const verifyPassword = useCallback(async (password) => {
    try {
      const username = useAuthStore.getState().user?.username;
      await authClient.post(ENDPOINTS.AUTH.LOGIN, { emailOrUsername: username, password });
      return { ok: true };
    } catch (err) {
      const msg = readError(err, 'Contraseña incorrecta.');
      return { ok: false, error: msg };
    }
  }, []);

  const handleResendVerification = useCallback(async ({ email }) => {
    setLoading(true);
    setError(null);
    try {
      await authClient.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
      return { ok: true };
    } catch (err) {
      const msg = readError(err, 'No pudimos reenviar la verificación.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleResetPassword,
    handleResendVerification,
    verifyPassword,
    logout,
  };
}

export default useAuth;
