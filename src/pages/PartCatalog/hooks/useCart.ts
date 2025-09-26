import { AccessoryInfo, PartsInfo } from '@/services/purchase/typings.d';
import { message } from 'antd';
import { useState } from 'react';

export const useCart = () => {
  const [selectedItems, setSelectedItems] = useState<
    (PartsInfo | AccessoryInfo)[]
  >([]);

  // 添加到购物车
  const addToCart = (item: PartsInfo | AccessoryInfo) => {
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.part_id === item.part_id,
    );
    if (existingIndex >= 0) {
      message.warning('该配件已在购物车中');
      return;
    }

    setSelectedItems([...selectedItems, item]);
    message.success('已添加到购物车');
  };

  // 从购物车移除
  const removeFromCart = (partId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.part_id !== partId));
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
