import { DatePicker, Form, Modal } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect } from 'react';

interface SendInquiryModalProps {
  visible: boolean;
  defaultDeadline?: string;
  loading?: boolean;
  onOk: (deadline: string) => Promise<void>;
  onCancel: () => void;
}

const SendInquiryModal: React.FC<SendInquiryModalProps> = ({
  visible,
  defaultDeadline,
  loading = false,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // 当弹窗打开时，设置默认值
  useEffect(() => {
    if (visible) {
      const deadline = dayjs().add(30, 'minutes');
      form.setFieldsValue({
        deadline: deadline,
      });
    } else {
      // 关闭时重置表单
      form.resetFields();
    }
  }, [visible, defaultDeadline, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldValue('deadline');
      const deadline = values.format('YYYY-MM-DD HH:mm:ss');
      await onOk(deadline);
    } catch (error: any) {
      // 表单验证错误，不处理（由 Form 自动显示错误信息）
      if (error?.errorFields) {
        return;
      }
      // 其他错误由父组件处理
      throw error;
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="发起询价"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认发起"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" onFinish={handleOk}>
        <Form.Item
          label="询价截止时间"
          name="deadline"
          rules={[
            { required: true, message: '请选择询价截止时间' },
            {
              validator: (_: any, value: Dayjs) => {
                if (value && value.isBefore(dayjs())) {
                  return Promise.reject(new Error('截止时间不能早于当前时间'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择询价截止时间"
            disabledDate={(current) =>
              current && current < dayjs().startOf('day')
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SendInquiryModal;
