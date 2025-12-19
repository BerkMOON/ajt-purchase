import { Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';

interface ShipModalProps {
  visible: boolean;
  loading: boolean;
  onOk: (trackingNoList: string[], remark: string) => void;
  onCancel: () => void;
}

const ShipModal: React.FC<ShipModalProps> = ({
  visible,
  loading,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 将快递单号字符串按换行或逗号分割成数组
      const trackingNoList = values.tracking_numbers
        .split(/[,\n]/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
      onOk(trackingNoList, values.remark || '');
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
      title="发货"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认发货"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="快递单号"
          name="tracking_numbers"
          rules={[
            { required: true, message: '请输入快递单号' },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const trackingNoList = value
                  .split(/[,\n]/)
                  .map((item: string) => item.trim())
                  .filter((item: string) => item.length > 0);
                if (trackingNoList.length === 0) {
                  return Promise.reject(new Error('请输入至少一个快递单号'));
                }
                return Promise.resolve();
              },
            },
          ]}
          extra="多个快递单号可用逗号或换行分隔"
        >
          <Input.TextArea
            placeholder="请输入快递单号，多个用逗号或换行分隔"
            rows={3}
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            placeholder="请输入备注信息（可选）"
            rows={2}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShipModal;
