// src/security/securityStore.js
// Estado de seguridad local: biometría habilitada y PIN de transacciones.
// El PIN se guarda en SecureStore (cifrado por el SO); no se persiste con el store.
import { create } from 'zustand';

import { secureGet, secureSet, secureDelete, SECURE_KEYS } from '@/shared/store/secureStorage';

export const useSecurityStore = create((set) => ({
  biometricEnabled: false,
  hasPin: false,
  loaded: false,

  load: async () => {
    const [bio, pin] = await Promise.all([
      secureGet(SECURE_KEYS.BIOMETRIC_ENABLED),
      secureGet(SECURE_KEYS.PIN_HASH),
    ]);
    set({ biometricEnabled: bio === '1', hasPin: !!pin, loaded: true });
  },

  setBiometricEnabled: async (value) => {
    await secureSet(SECURE_KEYS.BIOMETRIC_ENABLED, value ? '1' : '0');
    set({ biometricEnabled: value });
  },

  setPin: async (pin) => {
    await secureSet(SECURE_KEYS.PIN_HASH, String(pin));
    set({ hasPin: true });
  },

  verifyPin: async (pin) => {
    const stored = await secureGet(SECURE_KEYS.PIN_HASH);
    return !!stored && stored === String(pin);
  },

  clearPin: async () => {
    await secureDelete(SECURE_KEYS.PIN_HASH);
    set({ hasPin: false });
  },
}));

export default useSecurityStore;
