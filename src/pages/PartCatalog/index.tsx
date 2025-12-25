import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { COMMON_STATUS } from '@/constants';
import { CartAPI } from '@/services/cart/CartController';
import { GetSkuListParams, PurchaseAPI } from '@/services/purchase';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Button, message, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { getColumns } from './columns';
import CartModal from './components/CartModal';
import CreatePurchaseModal from './components/CreatePurchaseModal';
import { useCartData } from './hooks/useCartData';
import { usePurchaseCreation } from './hooks/usePurchaseCreation';
import { searchForm } from './searchForm';

const PartCatalog: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const [cartVisible, setCartVisible] = useState(false);

  // 使用购物车数据 hook
  const {
    cartItems,
    cartItemCount,
    loading: cartLoading,
    refreshCartData,
  } = useCartData(isLogin);

  // 添加到购物车
  const handleAddToCart = async (sku: {
    sku_id?: number;
    product_id?: number;
  }) => {
    if (!sku.sku_id) {
      message.error('SKU信息不完整');
      return;
    }

    try {
      // 每次添加数量为1，如果商品已存在，后端会累加数量
      await CartAPI.addToCart({
        sku_id: sku.sku_id,
        quantity: 1,
      });
      message.success('已添加到购物车');
      // 刷新购物车数据
      refreshCartData();
    } catch (error) {
      console.error('添加到购物车失败:', error);
      message.error('添加到购物车失败');
    }
  };

  const {
    createModalVisible,
    createLoading,
    form,
    handleCreatePurchase,
    handleSubmitPurchase,
    handleCancelCreate,
  } = usePurchaseCreation();

  // 获取 SKU 列表数据
  const fetchSkuData = async (params: GetSkuListParams) => {
    const { data } = await PurchaseAPI.getSkuList(params);
    return {
      list: data.sku_list || [],
      total: data.count?.total_count || 0,
    };
  };

  // 处理创建采购单
  const onCreatePurchase = () => {
    handleCreatePurchase();
    setCartVisible(false);
  };

  // 处理提交采购单
  const onSubmitPurchase = (values: any) => {
    handleSubmitPurchase(values);
  };

  const columns = getColumns({ onAddToCart: handleAddToCart });

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>配件目录</span>
          </Space>
        }
        columns={columns}
        searchFormItems={searchForm}
        fetchData={fetchSkuData}
        defaultSearchParams={{
          product_type: 'parts',
          status: COMMON_STATUS.ACTIVE,
        }}
        extraButtons={
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              setCartVisible(true);
            }}
          >
            购物车 ({cartItemCount})
          </Button>
        }
        rowKey="sku_id"
      />

      {/* 购物车弹窗 */}
      <CartModal
        visible={cartVisible}
        cartItems={cartItems}
        loading={cartLoading}
        onCancel={() => setCartVisible(false)}
        onCreatePurchase={onCreatePurchase}
        onRefresh={refreshCartData}
      />

      {/* 创建采购单弹窗 */}
      <CreatePurchaseModal
        visible={createModalVisible}
        loading={createLoading}
        form={form}
        onCancel={handleCancelCreate}
        onSubmit={onSubmitPurchase}
      />
    </>
  );
};

export default PartCatalog;
