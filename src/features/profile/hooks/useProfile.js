// src/features/profile/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';

import authClient from '@/shared/api/authClient';
import { unwrapItem } from '@/shared/api/bankClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { useAuthStore } from '@/shared/store/authStore';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateUser = useAuthStore((s) => s.updateUser);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.get(ENDPOINTS.AUTH.PROFILE);
      const data = unwrapItem(res, 'data', 'user');
      setProfile(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos cargar tu perfil.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // El cliente solo puede editar: name, surname, address, jobName, monthlyIncome.
  // El backend (PUT /auth/client-profile) valida ingresos >= Q100.
  const updateClientProfile = useCallback(
    async (values) => {
      const payload = {
        name: values.name,
        surname: values.surname,
        address: values.address,
        jobName: values.jobName || '',
        monthlyIncome: Number(values.monthlyIncome),
      };
      const res = await authClient.put(ENDPOINTS.AUTH.CLIENT_PROFILE, payload);
      setProfile((prev) => ({ ...prev, ...payload }));
      updateUser({ name: payload.name, surname: payload.surname });
      return res?.data;
    },
    [updateUser],
  );

  const changePassword = useCallback(async ({ currentPassword, newPassword, confirmPassword }) => {
    const res = await authClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return res?.data;
  }, []);

  return { profile, loading, error, refresh: fetchProfile, updateClientProfile, changePassword };
}

export default useProfile;
