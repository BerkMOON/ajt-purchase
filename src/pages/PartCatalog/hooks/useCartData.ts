import { CartAPI } from '@/services/cart/CartController';
import type { CartItem } from '@/services/cart/typings';
import { message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCartData = (isLogin: boolean) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  // 获取购物车数据的通用函数
  const fetchCartDataInternal = useCallback(async (showLoading = false) => {
    // 如果正在请求中，直接返回，避免重复请求
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await CartAPI.getCartList();
      if (response.response_status.code === 200 && response.data) {
        const items = response.data.sku_list || [];
        setCartItems(items);
        const totalQuantity = items.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0,
        );
        setCartItemCount(totalQuantity);
      }
    } catch (error) {
      console.error('获取购物车数据失败:', error);
      if (showLoading) {
        message.error('获取购物车数据失败');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  // 获取购物车数据（带 loading）
  const fetchCartData = useCallback(async () => {
    await fetchCartDataInternal(true);
  }, [fetchCartDataInternal]);

  // 刷新购物车数据（不带 loading，静默刷新）
  const refreshCartData = useCallback(async () => {
    await fetchCartDataInternal(false);
  }, [fetchCartDataInternal]);

  // 初始化时获取购物车数据
  useEffect(() => {
    if (isLogin) {
      fetchCartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  return {
    cartItems,
    cartItemCount,
    loading,
    fetchCartData,
    refreshCartData,
  };
};
