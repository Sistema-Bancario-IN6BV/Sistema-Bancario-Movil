// src/features/movements/hooks/useMovements.js
import { useState, useEffect, useCallback } from 'react';

import bankClient, { unwrapList } from '@/shared/api/bankClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { useAccountStore } from '@/shared/store/accountStore';
import { normalizeMovements } from '@/shared/utils/transactions';

// Historial global del cliente desde /transactions/my. El backend solo admite
// ?limit, así que el filtrado por tipo/fecha se hace en cliente.
export function useMovements({ limit } = {}) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const accounts = useAccountStore((s) => s.accounts);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const getOwnedKeys = useAccountStore((s) => s.getOwnedKeys);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (accounts.length === 0) {
        await fetchAccounts();
      }
      const res = await bankClient.get(ENDPOINTS.TRANSACTIONS.MY, {
        params: limit ? { limit } : undefined,
      });
      const raw = unwrapList(res, 'transactions', 'data');
      setMovements(normalizeMovements(raw, getOwnedKeys()));
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos cargar tus movimientos.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, accounts.length]);

  useEffect(() => {
    load();
  }, [load]);

  return { movements, loading, error, refresh: load };
}

export default useMovements;
