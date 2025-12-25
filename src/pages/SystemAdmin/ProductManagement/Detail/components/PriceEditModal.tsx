import { formatPriceToFen } from '@/utils/prince';
import { Form, InputNumber, Modal } from 'antd';
import React, { useEffect } from 'react';

interface PriceEditModalProps {
  visible: boolean;
  loading: boolean;
  defaultPrices?: {
    origin_price?: number;
    ceiling_price?: number;
    return_purchase_price?: number;
  };
  onOk: (values: {
    origin_price: number;
    ceiling_price: number;
    return_purchase_price: number;
  }) => void;
  onCancel: () => void;
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
  visible,
  loading,
  defaultPrices,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && defaultPrices) {
      // 将分转换为元，用于表单显示
      form.setFieldsValue({
        origin_price: defaultPrices.origin_price
          ? defaultPrices.origin_price / 100
          : undefined,
        ceiling_price: defaultPrices.ceiling_price
          ? defaultPrices.ceiling_price / 100
          : undefined,
        return_purchase_price: defaultPrices.return_purchase_price
          ? defaultPrices.return_purchase_price / 100
          : undefined,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, defaultPrices, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 将元转换为分
      await onOk({
        origin_price: formatPriceToFen(values.origin_price) || 0,
        ceiling_price: formatPriceToFen(values.ceiling_price) || 0,
        return_purchase_price:
          formatPriceToFen(values.return_purchase_price) || 0,
      });
      form.resetFields();
    } catch (error) {
      // 表单验证失败，不处理
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="编辑价格"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="原厂价"
          name="origin_price"
          rules={[{ required: true, message: '请输入原厂价' }]}
        >
          <InputNumber
            addonBefore="¥"
            addonAfter="元"
            precision={2}
            placeholder="请输入原厂价"
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        <Form.Item label="建议零售价" name="ceiling_price">
          <InputNumber
            addonBefore="¥"
            addonAfter="元"
            precision={2}
            placeholder="请输入建议零售价"
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        <Form.Item label="回采价" name="return_purchase_price">
          <InputNumber
            addonBefore="¥"
            addonAfter="元"
            precision={2}
            placeholder="请输入回采价"
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PriceEditModal;
