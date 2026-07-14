// src/features/transfers/hooks/useTransfers.js
import { useState, useEffect, useCallback } from 'react';

import bankClient, { unwrapList, unwrapItem } from '@/shared/api/bankClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';

function normalizeFavorite(f) {
  const account = f?.accountId && typeof f.accountId === 'object' ? f.accountId : null;
  return {
    id: f?._id || f?.id,
    alias: f?.alias,
    accountId: account?._id || account?.id || f?.accountId,
    accountNumber: account?.accountNumber || f?.accountNumber,
  };
}

export function useTransfers() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bankClient.get(ENDPOINTS.FAVORITES.LIST);
      setFavorites(unwrapList(res, 'favorites', 'data').map(normalizeFavorite));
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos cargar tus favoritos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const lookupAccount = useCallback(async (accountNumber) => {
    const res = await bankClient.get(ENDPOINTS.ACCOUNTS.LOOKUP(accountNumber));
    return unwrapItem(res, 'account', 'data');
  }, []);

  const addFavorite = useCallback(
    async ({ alias, accountNumber }) => {
      const account = await lookupAccount(accountNumber);
      const accountId = account?._id || account?.id;
      if (!accountId) throw new Error('Cuenta no encontrada');
      await bankClient.post(ENDPOINTS.FAVORITES.CREATE, { accountId, alias });
      await fetchFavorites();
    },
    [lookupAccount, fetchFavorites],
  );

  const removeFavorite = useCallback(
    async (id) => {
      await bankClient.delete(ENDPOINTS.FAVORITES.DELETE(id));
      await fetchFavorites();
    },
    [fetchFavorites],
  );

  const updateFavorite = useCallback(
    async (id, alias) => {
      await bankClient.put(ENDPOINTS.FAVORITES.UPDATE(id), { alias });
      await fetchFavorites();
    },
    [fetchFavorites],
  );

  // Transferencia estándar: el backend valida monto máx Q2,000, límite diario
  // Q10,000, saldo suficiente y existencia del destino.
  const createTransfer = useCallback(async ({ sourceAccount, destinationAccount, amount, description }) => {
    const res = await bankClient.post(ENDPOINTS.TRANSACTIONS.CREATE, {
      type: 'TRANSFER',
      amount: Number(amount),
      sourceAccount,
      destinationAccount,
      description,
    });
    return res?.data;
  }, []);

  const fastTransfer = useCallback(async ({ favoriteId, sourceAccount, amount }) => {
    const res = await bankClient.post(ENDPOINTS.FAVORITES.FAST_TRANSFER, {
      favoriteId,
      sourceAccount,
      amount: Number(amount),
    });
    return res?.data;
  }, []);

  return {
    favorites,
    loading,
    error,
    refreshFavorites: fetchFavorites,
    lookupAccount,
    addFavorite,
    removeFavorite,
    updateFavorite,
    createTransfer,
    fastTransfer,
  };
}

export default useTransfers;
