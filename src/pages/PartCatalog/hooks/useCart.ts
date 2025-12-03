import type { SkuListInfo } from '@/services/system/sku/typings';
import { message } from 'antd';
import { useState } from 'react';

export interface CartItem extends SkuListInfo {
  product_id?: number;
}

export const useCart = () => {
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);

  // 添加到购物车
  const addToCart = (item: CartItem) => {
    if (!item.sku_id) {
      message.error('SKU信息不完整');
      return;
    }

    const existingIndex = selectedItems.findIndex(
      (selected) => selected.sku_id === item.sku_id,
    );
    if (existingIndex >= 0) {
      message.warning('该SKU已在购物车中');
      return;
    }

    setSelectedItems([...selectedItems, item]);
    message.success('已添加到购物车');
  };

  // 从购物车移除
  const removeFromCart = (skuId: number) => {
    setSelectedItems(selectedItems.filter((item) => item.sku_id !== skuId));
  };

  // 清空购物车
  const clearCart = () => {
    setSelectedItems([]);
  };

  return {
    selectedItems,
    addToCart,
    removeFromCart,
    clearCart,
  };
};
