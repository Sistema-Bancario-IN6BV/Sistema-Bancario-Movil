// src/shared/store/transferStore.js
// Borrador de una transferencia en curso (una a la vez). Sin persistencia.
// destination = { type: 'favorite' | 'new', accountId, favoriteId, alias, accountNumber }
import { create } from 'zustand';

const EMPTY = {
  originAccountId: null,
  destination: null,
  amount: '',
  concept: '',
};

export const useTransferStore = create((set, get) => ({
  ...EMPTY,

  setOrigin: (accountId) =>
    set((state) => {
      // Si cambia la cuenta origen a mitad del flujo, limpiar el resto del borrador.
      if (state.originAccountId && state.originAccountId !== accountId) {
        return { originAccountId: accountId, destination: null, amount: '', concept: '' };
      }
      return { originAccountId: accountId };
    }),

  setDestination: (destination) => set({ destination }),
  setAmount: (amount) => set({ amount }),
  setConcept: (concept) => set({ concept }),

  clearDraft: () => set({ ...EMPTY }),

  isComplete: () => {
    const { originAccountId, destination, amount } = get();
    const numeric = Number(amount);
    return Boolean(originAccountId && destination && numeric > 0);
  },
}));

export default useTransferStore;
