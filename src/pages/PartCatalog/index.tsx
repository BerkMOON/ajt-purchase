import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { ProductAPI } from '@/services/system/product/ProductController';
import type {
  GetProductListParams,
  ProductInfo,
} from '@/services/system/product/typings';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Button, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { getColumns, SkuExpandableTable } from './columns';
import CartModal from './components/CartModal';
import CreatePurchaseModal from './components/CreatePurchaseModal';
import { useCart } from './hooks/useCart';
import { usePurchaseCreation } from './hooks/usePurchaseCreation';
import { searchForm } from './searchForm';

const PartCatalog: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const [cartVisible, setCartVisible] = useState(false);

  // 使用自定义Hooks管理状态和逻辑
  const { selectedItems, addToCart, removeFromCart, clearCart } = useCart();

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
    const { data } = await ProductAPI.getProductList(processedParams);
    return {
      list: data.product_list || [],
      total: (data as any).count?.total_count || 0,
    };
  };

  // 处理创建采购单
  const onCreatePurchase = () => {
    handleCreatePurchase(selectedItems);
    setCartVisible(false);
  };

  // 处理提交采购单
  const onSubmitPurchase = (values: any) => {
    handleSubmitPurchase(values, selectedItems, clearCart);
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
            onClick={() => setCartVisible(true)}
          >
            购物车 ({selectedItems.length})
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
              onAddToCart={addToCart}
              expanded={expandedRowKeys.includes(record.product_id!)}
            />
          ),
          rowExpandable: (record: ProductInfo) => !!record.product_id,
        }}
      />

      {/* 购物车弹窗 */}
      <CartModal
        visible={cartVisible}
        items={selectedItems}
        onCancel={() => setCartVisible(false)}
        onCreatePurchase={onCreatePurchase}
        onRemoveItem={removeFromCart}
      />

      {/* 创建采购单弹窗 */}
      <CreatePurchaseModal
        visible={createModalVisible}
        loading={createLoading}
        form={form}
        selectedItems={selectedItems}
        onCancel={handleCancelCreate}
        onSubmit={onSubmitPurchase}
      />
    </>
  );
};

export default PartCatalog;
