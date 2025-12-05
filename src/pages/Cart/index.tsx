import { CartAPI } from '@/services/cart/CartController';
import type { CartItem } from '@/services/cart/typings';
import { Navigate, useAccess } from '@umijs/max';
import { Card, Table, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { getCartColumns } from '../PartCatalog/components/cartColumns';

const Cart: React.FC = () => {
  const { isLogin } = useAccess();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取购物车列表
  const fetchCartList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await CartAPI.getCartList();
      if (response.response_status.code === 200 && response.data) {
        setCartItems(response.data.sku_list || []);
      }
    } catch (error) {
      console.error('获取购物车列表失败:', error);
      message.error('获取购物车列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLogin) {
      fetchCartList();
    }
  }, [isLogin, fetchCartList]);

  // 更新商品数量
  const handleQuantityChange = async (skuId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      message.warning('数量必须大于0');
      return;
    }

    try {
      await CartAPI.updateCartQuantity({
        sku_id: skuId,
        quantity: newQuantity,
      });
      message.success('更新成功');
      // 刷新购物车列表
      fetchCartList();
    } catch (error) {
      console.error('更新数量失败:', error);
      message.error('更新数量失败');
    }
  };

  // 增加数量
  const handleIncrease = (item: CartItem) => {
    const newQuantity = (item.quantity || 0) + 1;
    handleQuantityChange(item.sku_id, newQuantity);
  };

  // 减少数量
  const handleDecrease = (item: CartItem) => {
    const currentQuantity = item.quantity || 0;
    if (currentQuantity <= 1) {
      message.warning('数量不能小于1，如需删除请点击删除按钮');
      return;
    }
    const newQuantity = currentQuantity - 1;
    handleQuantityChange(item.sku_id, newQuantity);
  };

  // 删除商品
  const handleRemove = async (skuId: number) => {
    try {
      await CartAPI.removeFromCart({ sku_id: skuId });
      message.success('删除成功');
      // 刷新购物车列表
      fetchCartList();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const columns = getCartColumns({
    handleQuantityChange,
    handleIncrease,
    handleDecrease,
    handleRemove,
    loading,
    showDeleteConfirm: true,
    actionColumnWidth: 100,
    skuIdColumnWidth: 120,
    fixedActionColumn: true,
  });

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <Card title="购物车">
      <Table
        columns={columns}
        dataSource={cartItems}
        rowKey="sku_id"
        loading={loading}
        pagination={false}
        locale={{
          emptyText: '购物车是空的',
        }}
      />
    </Card>
  );
};

export default Cart;
