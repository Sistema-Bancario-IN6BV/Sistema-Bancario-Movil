// src/features/home/hooks/useAccounts.js
import { useState, useEffect, useCallback } from 'react';

import bankClient, { unwrapItem } from '@/shared/api/bankClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { useAccountStore } from '@/shared/store/accountStore';

export function useAccounts() {
  const accounts = useAccountStore((s) => s.accounts);
  const loading = useAccountStore((s) => s.loading);
  const error = useAccountStore((s) => s.error);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const fetchAccountSummary = useAccountStore((s) => s.fetchAccountSummary);
  const hasPendingRequest = useAccountStore((s) => s.hasPendingRequest);
  const requestingAccount = useAccountStore((s) => s.requestingAccount);
  const requestError = useAccountStore((s) => s.requestError);
  const requestAccount = useAccountStore((s) => s.requestAccount);

  useEffect(() => {
    fetchAccounts();
    fetchAccountSummary();
  }, [fetchAccounts, fetchAccountSummary]);

  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const getAccountDetail = useCallback(async (id) => {
    const res = await bankClient.get(ENDPOINTS.ACCOUNTS.DETAIL(id));
    return unwrapItem(res, 'account', 'updated', 'data');
  }, []);

  const convertBalance = useCallback(async (id, currencies = []) => {
    const to = currencies.join(',');
    const res = await bankClient.get(ENDPOINTS.ACCOUNTS.CONVERT(id), { params: { to } });
    return res?.data; // { saldoOriginal, monedaOrigen, saldoConvertido, monedaDestino }
  }, []);

  return {
    accounts,
    loading,
    error,
    totalBalance,
    refresh: fetchAccounts,
    getAccountDetail,
    convertBalance,
    hasPendingRequest,
    requestingAccount,
    requestError,
    requestAccount,
    refreshSummary: fetchAccountSummary,
  };
}

export default useAccounts;
