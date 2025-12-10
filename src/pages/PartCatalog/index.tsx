import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { CartAPI } from '@/services/cart/CartController';
import { PurchaseAPI } from '@/services/purchase';
import type {
  GetProductListParams,
  ProductInfo,
} from '@/services/system/product/typings';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Button, message, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { getColumns, SkuExpandableTable } from './columns';
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

  // 获取产品列表数据
  const fetchProductData = async (params: GetProductListParams) => {
    // 处理 category_id：如果是数组，取最后一个值
    const processedParams = {
      ...params,
      category_id: Array.isArray(params.category_id)
        ? params.category_id[params.category_id.length - 1]
        : params.category_id,
    };
    const { data } = await PurchaseAPI.getProductList(processedParams);
    return {
      list: data.product_list || [],
      total: (data as any).count?.total_count || 0,
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

  const columns = getColumns();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

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
        searchFormItems={searchForm()}
        fetchData={fetchProductData}
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
        rowKey="product_id"
        expandable={{
          expandedRowKeys,
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedRowKeys([...expandedRowKeys, record.product_id!]);
            } else {
              setExpandedRowKeys(
                expandedRowKeys.filter((key) => key !== record.product_id),
              );
            }
          },
          expandedRowRender: (record: ProductInfo) => (
            <SkuExpandableTable
              productId={record.product_id!}
              onAddToCart={handleAddToCart}
              expanded={expandedRowKeys.includes(record.product_id!)}
            />
          ),
          rowExpandable: (record: ProductInfo) => !!record.product_id,
        }}
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
