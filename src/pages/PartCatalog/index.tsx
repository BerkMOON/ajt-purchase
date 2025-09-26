import { ShoppingCartOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Button, Card, Col, Row } from 'antd';
import React, { useState } from 'react';

import CartModal from './components/CartModal';
import CreatePurchaseModal from './components/CreatePurchaseModal';
import PartsList from './components/PartsList';
import { useCart } from './hooks/useCart';
import { usePartSearch } from './hooks/usePartSearch';
import { usePurchaseCreation } from './hooks/usePurchaseCreation';

const PartCatalog: React.FC = () => {
  const { isLogin } = useAccess();
  const [cartVisible, setCartVisible] = useState(false);

  // 使用自定义Hooks管理状态和逻辑
  const { selectedItems, addToCart, removeFromCart, clearCart } = useCart();

  const {
    loading,
    parts,
    searchParams,
    handleTabChange,
    handleSearch,
    updateSearchParams,
  } = usePartSearch();

  const {
    createModalVisible,
    createLoading,
    form,
    handleCreatePurchase,
    handleSubmitPurchase,
    handleCancelCreate,
  } = usePurchaseCreation();

  // 处理创建采购单
  const onCreatePurchase = () => {
    handleCreatePurchase(selectedItems);
    setCartVisible(false);
  };

  // 处理提交采购单
  const onSubmitPurchase = (values: any) => {
    handleSubmitPurchase(values, selectedItems, clearCart);
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h2 style={{ margin: 0 }}>配件目录</h2>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => setCartVisible(true)}
                  >
                    购物车 ({selectedItems.length})
                  </Button>
                </Col>
              </Row>
            </div>

            <PartsList
              loading={loading}
              parts={parts}
              searchParams={searchParams}
              onTabChange={handleTabChange}
              onSearch={handleSearch}
              onUpdateParams={updateSearchParams}
              onAddToCart={addToCart}
            />
          </Card>
        </Col>
      </Row>

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
    </div>
  );
};

export default PartCatalog;
