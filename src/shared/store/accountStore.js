// src/shared/store/accountStore.js
// Estado compartido de las cuentas del cliente (lo consumen Inicio, Transferencias
// y Movimientos). Sin persistencia: se recarga al entrar.
import { create } from 'zustand';

import bankClient, { unwrapList, unwrapItem } from '@/shared/api/bankClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';

function normalizeAccount(a) {
  return {
    id: a?._id || a?.id,
    accountNumber: a?.accountNumber,
    balance: Number(a?.balance) || 0,
    status: a?.status || 'ACTIVE',
    points: Number(a?.points) || 0,
    currency: a?.currency || 'GTQ',
  };
}

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  loaded: false,

  // Solicitud de cuenta (POST /accounts/requests): un usuario sin cuenta
  // puede solicitar una; un admin la aprueba/rechaza desde el panel web.
  hasPendingRequest: false,
  requestingAccount: false,
  requestError: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bankClient.get(ENDPOINTS.ACCOUNTS.ME);
      const accounts = unwrapList(res, 'accounts', 'data').map(normalizeAccount);
      set({ accounts, loaded: true });
      return accounts;
    } catch (err) {
      set({ error: err?.response?.data?.message || 'No pudimos cargar tus cuentas.' });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchAccountSummary: async () => {
    try {
      const res = await bankClient.get(ENDPOINTS.ACCOUNTS.SUMMARY);
      const summary = unwrapItem(res) || {};
      set({ hasPendingRequest: !!summary.hasPendingRequest });
      return summary;
    } catch {
      return null;
    }
  },

  requestAccount: async () => {
    set({ requestingAccount: true, requestError: null });
    try {
      await bankClient.post(ENDPOINTS.ACCOUNTS.REQUEST);
      set({ hasPendingRequest: true });
      return { ok: true };
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos enviar tu solicitud.';
      set({ requestError: message });
      return { ok: false, message };
    } finally {
      set({ requestingAccount: false });
    }
  },

  getById: (id) => get().accounts.find((a) => a.id === id),

  // Conjunto de identificadores propios (id y número) para determinar dirección
  // de un movimiento (ingreso vs egreso).
  getOwnedKeys: () => {
    const keys = new Set();
    for (const a of get().accounts) {
      if (a.id) keys.add(String(a.id));
      if (a.accountNumber) keys.add(String(a.accountNumber));
    }
    return keys;
  },

  totalBalance: () => get().accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
}));

export default useAccountStore;
