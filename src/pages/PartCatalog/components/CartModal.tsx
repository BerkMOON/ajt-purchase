import { CartAPI } from '@/services/cart/CartController';
import type { CartItem } from '@/services/cart/typings';
import { Button, Modal, Popconfirm, Table, message } from 'antd';
import React from 'react';
import { getCartColumns } from './cartColumns';

interface CartModalProps {
  visible: boolean;
  cartItems: CartItem[];
  loading: boolean;
  onCancel: () => void;
  onCreatePurchase: () => void;
  onRefresh: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  visible,
  cartItems,
  loading,
  onCancel,
  onCreatePurchase,
  onRefresh,
}) => {
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
      // 只调用一次刷新，hook 内部会更新数据
      onRefresh();
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
  const handleRemoveItem = async (skuId: number) => {
    try {
      await CartAPI.removeFromCart({ sku_id: skuId });
      message.success('删除成功');
      // 只调用一次刷新，hook 内部会更新数据
      onRefresh();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 清空购物车
  const handleClearCart = async () => {
    try {
      await CartAPI.clearCart();
      message.success('购物车已清空');
      // 只调用一次刷新，hook 内部会更新数据
      onRefresh();
    } catch (error) {
      console.error('清空购物车失败:', error);
      message.error('清空购物车失败');
    }
  };

  // 计算总数量
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const cartColumns = getCartColumns({
    handleQuantityChange,
    handleIncrease,
    handleDecrease,
    handleRemove: handleRemoveItem,
    loading,
    showDeleteConfirm: false,
    actionColumnWidth: 80,
    skuIdColumnWidth: 150,
    fixedActionColumn: false,
  });

  return (
    <Modal
      title={`购物车 (${totalQuantity}件商品)`}
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          继续选购
        </Button>,
        <Popconfirm
          key="clear"
          title="确定要清空购物车吗？"
          description="此操作将删除购物车中的所有商品"
          onConfirm={handleClearCart}
          okText="确定"
          cancelText="取消"
          disabled={cartItems.length === 0 || loading}
        >
          <Button danger disabled={cartItems.length === 0 || loading}>
            清空购物车
          </Button>
        </Popconfirm>,
        <Button
          key="create"
          type="primary"
          disabled={cartItems.length === 0}
          onClick={onCreatePurchase}
        >
          创建采购单
        </Button>,
      ]}
    >
      <Table
        dataSource={cartItems}
        rowKey="sku_id"
        pagination={false}
        size="small"
        columns={cartColumns}
        loading={loading}
        locale={{
          emptyText: '购物车是空的',
        }}
      />
    </Modal>
  );
};

export default CartModal;
