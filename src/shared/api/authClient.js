// src/shared/api/authClient.js
// Cliente Axios para AuthService (.NET, identidad).
import axios from 'axios';

import { ENDPOINTS, AUTH_PUBLIC_PATHS } from '@/shared/constants/endpoints';
import { useAuthStore } from '@/shared/store/authStore';

const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH_BASE,
  timeout: 12000,
});

authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isPublic = AUTH_PUBLIC_PATHS.some((p) => url.includes(p));
    // No hay refresh token en el backend: en 401 (fuera de flujos públicos) se
    // cierra sesión; AppNavigator vuelve automáticamente al AuthStack.
    if (status === 401 && !isPublic) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default authClient;
