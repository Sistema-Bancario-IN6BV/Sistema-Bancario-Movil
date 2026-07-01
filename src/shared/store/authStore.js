// src/shared/store/authStore.js
// Estado de sesión. El JWT vive en SecureStore (sensible); el resto del perfil
// se persiste con AsyncStorage. NO hay refreshToken: AuthService no lo soporta,
// así que en 401 se cierra sesión y se vuelve al login.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { secureGet, secureSet, secureDelete, SECURE_KEYS } from './secureStorage';
import { normalizeRole } from '@/shared/utils/authRole';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Login: guarda el token en SecureStore y los datos de usuario en memoria/persistencia.
      login: async (token, user) => {
        await secureSet(SECURE_KEYS.TOKEN, token);
        const normalized = user ? { ...user, role: normalizeRole(user.role) } : null;
        set({ token, user: normalized, isAuthenticated: true });
      },

      setToken: async (token) => {
        await secureSet(SECURE_KEYS.TOKEN, token);
        set({ token });
      },

      // Mezcla parcial del usuario (tras editar perfil).
      updateUser: (patch) =>
        set((state) => ({ user: { ...(state.user || {}), ...patch } })),

      logout: async () => {
        await secureDelete(SECURE_KEYS.TOKEN);
        set({ token: null, user: null, isAuthenticated: false });
      },

      getToken: () => get().token,

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'cb-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // El token NO se persiste aquí (va a SecureStore).
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => async (state) => {
        // Reconciliar token desde SecureStore tras rehidratar el perfil.
        const token = await secureGet(SECURE_KEYS.TOKEN);
        const hasUser = !!(state && state.user);
        useAuthStore.setState({
          token: token || null,
          isAuthenticated: !!token && hasUser,
          _hasHydrated: true,
        });
      },
    },
  ),
);

export default useAuthStore;
