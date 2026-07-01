// src/features/products/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';

import bankClient, { unwrapList } from '@/shared/api/bankClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';

function normalizeProduct(p) {
  return {
    id: p?._id || p?.id,
    name: p?.name,
    description: p?.description || '',
    price: Number(p?.price) || 0,
    isActive: p?.isActive !== false,
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bankClient.get(ENDPOINTS.PRODUCTS.LIST);
      const list = unwrapList(res, 'products', 'data').map(normalizeProduct);
      setProducts(list.filter((p) => p.isActive));
    } catch (err) {
      setError(err?.response?.data?.message || 'No pudimos cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const purchaseProduct = useCallback(async ({ productId, accountId }) => {
    const res = await bankClient.post(ENDPOINTS.PRODUCTS.PURCHASE, { productId, accountId });
    return res?.data;
  }, []);

  const fetchPurchaseHistory = useCallback(async (accountId) => {
    const res = await bankClient.get(ENDPOINTS.PRODUCTS.HISTORY(accountId));
    return unwrapList(res, 'purchases', 'data');
  }, []);

  return {
    products,
    loading,
    error,
    refreshProducts: fetchProducts,
    purchaseProduct,
    fetchPurchaseHistory,
  };
}

export default useProducts;
