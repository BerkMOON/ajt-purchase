import { formatDate } from '@/pages/PurchaseDetail/utils';
import { CartAPI } from '@/services/cart/CartController';
import { SubmitCartParams } from '@/services/cart/typings';
import { CategoryType } from '@/services/purchase/typings.d';
import { history } from '@umijs/max';
import { Form, message } from 'antd';
import { useState } from 'react';

export const usePurchaseCreation = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  // 处理创建采购单
  const handleCreatePurchase = async () => {
    try {
      // 获取购物车数据
      const response = await CartAPI.getCartList();
      if (
        response.response_status.code !== 200 ||
        !response.data ||
        response.data.sku_list.length === 0
      ) {
        message.error('购物车为空，请先添加商品');
        return;
      }

      setCreateModalVisible(true);
    } catch (error) {
      console.error('获取购物车数据失败:', error);
      message.error('获取购物车数据失败');
    }
  };

  // 提交创建采购单
  const handleSubmitPurchase = async (values: any) => {
    try {
      setCreateLoading(true);

      // 构建回采商品列表：根据 return_purchase 字段，找出所有勾选为 true 的 sku_id
      const returnPurchaseList: number[] = [];

      if (
        values.return_purchase &&
        typeof values.return_purchase === 'object'
      ) {
        Object.entries(values.return_purchase).forEach(
          ([skuIdStr, isChecked]) => {
            // Checkbox 的值应该是布尔值
            if (isChecked === true) {
              const skuId = Number(skuIdStr);
              if (!isNaN(skuId) && skuId > 0) {
                returnPurchaseList.push(skuId);
              }
            }
          },
        );
      }

      const createParams: SubmitCartParams = {
        expected_delivery_date: formatDate(values.expected_delivery_date, true),
        remark: values.remark || '',
        order_type: CategoryType.PARTS, // 备件类型
        return_purchase_list: returnPurchaseList,
      };

      const response = await CartAPI.submitCart(createParams);

      if (response.response_status.code === 200) {
        message.success('采购单创建成功');
        setCreateModalVisible(false);
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
