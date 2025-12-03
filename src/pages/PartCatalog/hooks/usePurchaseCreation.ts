import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { CreatePurchaseParams } from '@/services/purchase/typings.d';
import { history } from '@umijs/max';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { CartItem } from './useCart';

export const usePurchaseCreation = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  // 处理创建采购单
  const handleCreatePurchase = (selectedItems: CartItem[]) => {
    if (selectedItems.length === 0) {
      message.error('请先选择SKU');
      return;
    }

    setCreateModalVisible(true);
  };

  // 提交创建采购单
  const handleSubmitPurchase = async (
    values: any,
    selectedItems: CartItem[],
    clearCart: () => void,
  ) => {
    try {
      setCreateLoading(true);

      // 确定门店ID（从表单值中获取）
      const storeId = values.store_id;
      if (!storeId) {
        message.error('请选择采购门店');
        setCreateLoading(false);
        return;
      }

      // 转换购物车数据为采购单详情
      const items = selectedItems
        .filter(
          (item): item is CartItem & { sku_id: number } =>
            item.sku_id !== undefined && item.sku_id !== null,
        )
        .map((item) => {
          const skuId = item.sku_id;
          const quantity = values.quantities?.[skuId] || 1;
          return {
            sku_id: skuId,
            quantity: quantity,
          };
        });

      const createParams: CreatePurchaseParams = {
        store_id: storeId,
        expected_delivery_date:
          values.expected_delivery_date.format('YYYY-MM-DD'),
        inquiry_deadline: values.inquiry_deadline
          ? dayjs(values.inquiry_deadline).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        remark: values.remark,
        order_type: 1, // 备件类型
        items: items,
      };

      const response = await PurchaseAPI.createDraft(createParams);

      if (response.response_status.code === 200) {
        message.success('草稿采购单创建成功');
        setCreateModalVisible(false);
        clearCart();
        form.resetFields();

        // 跳转到采购单列表页
        history.push(`/purchase`);
      } else {
        message.error(response.response_status.msg || '创建失败');
      }
    } catch (error) {
      message.error('创建采购单失败');
      console.error(error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  return {
    createModalVisible,
    createLoading,
    form,
    handleCreatePurchase,
    handleSubmitPurchase,
    handleCancelCreate,
  };
};
