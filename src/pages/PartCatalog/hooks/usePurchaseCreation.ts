import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import {
  AccessoryInfo,
  CategoryType,
  CreatePurchaseParams,
  PartsInfo,
  PurchaseDetailItem,
} from '@/services/purchase/typings.d';
import { history } from '@umijs/max';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

export const usePurchaseCreation = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  // 处理创建采购单
  const handleCreatePurchase = (
    selectedItems: (PartsInfo | AccessoryInfo)[],
  ) => {
    if (selectedItems.length === 0) {
      message.error('请先选择配件');
      return;
    }

    setCreateModalVisible(true);

    // 设置表单默认值
    form.setFieldsValue({
      expected_delivery_date: dayjs().add(7, 'days'),
      remark: '',
    });
  };

  // 提交创建采购单
  const handleSubmitPurchase = async (
    values: any,
    selectedItems: (PartsInfo | AccessoryInfo)[],
    clearCart: () => void,
  ) => {
    try {
      setCreateLoading(true);

      // 转换购物车数据为采购单详情
      const purchase_details: Omit<
        PurchaseDetailItem,
        'id' | 'historical_avg_price'
      >[] = selectedItems.map((item) => {
        const quantity = values.quantities?.[item.part_id] || 1;

        const baseDetail = {
          part_code: item.part_code,
          part_name: item.part_name,
          specification: item.specification,
          quantity: quantity,
          unit: item.unit,
          category_type: CategoryType.PARTS, // 暂时只支持备件
        };

        // 【已删除】精品类型特殊处理 - 暂不支持精品模块
        // 所有配件统一按备件处理
        return baseDetail;
      });

      const createParams: CreatePurchaseParams = {
        expected_delivery_date:
          values.expected_delivery_date.format('YYYY-MM-DD'),
        remark: values.remark,
        purchase_details,
      };

      const response = await PurchaseAPI.createPurchase(createParams);

      if (response.response_status.code === 200) {
        message.success('采购单创建成功');
        setCreateModalVisible(false);
        clearCart();
        form.resetFields();

        // 跳转到采购单详情页
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
