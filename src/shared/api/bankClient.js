// src/shared/api/bankClient.js
// Cliente Axios para la Bank API (Node, banca: cuentas, transacciones, favoritos).
import axios from 'axios';

import { ENDPOINTS } from '@/shared/constants/endpoints';
import { useAuthStore } from '@/shared/store/authStore';

const bankClient = axios.create({
  baseURL: ENDPOINTS.BANK_BASE,
  timeout: 15000,
});

bankClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

bankClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

// Parseo defensivo: el backend a veces devuelve un array crudo, a veces un objeto
// envuelto ({ accounts: [...] }, { data: [...] }, { success, data }). Espejamos el
// patrón del frontend web.
export function unwrapList(response, ...keys) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

export function unwrapItem(response, ...keys) {
  const data = response?.data;
  if (data == null) return null;
  for (const key of keys) {
    if (data?.[key] != null) return data[key];
  }
  if (data?.data != null) return data.data;
  return data;
}

export default bankClient;
