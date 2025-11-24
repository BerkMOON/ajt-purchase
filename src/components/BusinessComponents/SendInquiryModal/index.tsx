import { InquiryAPI } from '@/services/inquiry';
import { DatePicker, Form, Input, message, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

interface SendInquiryModalProps {
  visible: boolean;
  orderInfo: {
    order_id: number;
    order_no: string;
  };
  currentUserId: number;
  currentUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  contact_phone?: string;
}

const SendInquiryModal: React.FC<SendInquiryModalProps> = ({
  visible,
  orderInfo,
  currentUserId,
  currentUserName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers] = useState(false);

  // 获取供应商列表
  useEffect(() => {
    if (visible) {
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 格式化日期时间
      const inquiryDeadline = values.inquiry_deadline.format(
        'YYYY-MM-DD HH:mm:ss',
      );

      await InquiryAPI.sendInquiry({
        order_id: orderInfo.order_id,
        order_no: orderInfo.order_no,
        supplier_ids: values.supplier_ids,
        inquiry_deadline: inquiryDeadline,
        operator_id: currentUserId,
        operator_name: currentUserName,
        remark: values.remark || '',
      });

      message.success('询价发送成功');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('发送询价失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="发送询价"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText="发送询价"
      cancelText="取消"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          inquiry_deadline: dayjs()
            .add(3, 'day')
            .hour(23)
            .minute(59)
            .second(59),
        }}
      >
        <Form.Item label="采购单号">
          <Input value={orderInfo.order_no} disabled />
        </Form.Item>

        <Form.Item
          label="选择供应商"
          name="supplier_ids"
          rules={[
            { required: true, message: '请至少选择一个供应商' },
            {
              validator: (_, value) => {
                if (value && value.length < 2) {
                  return Promise.reject('建议至少选择2个供应商进行询价对比');
                }
                return Promise.resolve();
              },
            },
          ]}
          extra="建议选择至少2个供应商进行报价对比"
        >
          <Select
            mode="multiple"
            placeholder="请选择供应商（可多选）"
            loading={loadingSuppliers}
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={suppliers.map((supplier) => ({
              label: `${supplier.name}${
                supplier.contact_person ? ` - ${supplier.contact_person}` : ''
              }`,
              value: supplier.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="询价截止时间"
          name="inquiry_deadline"
          rules={[
            { required: true, message: '请选择询价截止时间' },
            {
              validator: (_, value) => {
                if (value && value.isBefore(dayjs())) {
                  return Promise.reject('截止时间不能早于当前时间');
                }
                return Promise.resolve();
              },
            },
          ]}
          extra="供应商需要在此时间前完成报价"
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="选择截止时间"
            disabledDate={(current) => {
              // 不能选择过去的日期
              return current && current < dayjs().startOf('day');
            }}
          />
        </Form.Item>

        <Form.Item
          label="备注说明"
          name="remark"
          extra="可以填写特殊要求、交货时间等重要信息"
        >
          <TextArea
            rows={4}
            placeholder="请输入备注信息（选填）&#10;例如：&#10;- 请提供原厂配件&#10;- 需提供质保证明&#10;- 交货时间要求等"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div
          style={{
            padding: '12px',
            background: '#f0f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '4px',
            marginTop: '16px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#096dd9' }}>
            <strong>📋 询价流程说明：</strong>
          </p>
          <ol
            style={{ margin: '8px 0 0 20px', fontSize: '13px', color: '#666' }}
          >
            <li>选择供应商并设置截止时间后，点击&quot;发送询价&quot;</li>
            <li>系统将向所选供应商发送询价通知</li>
            <li>供应商在供应商门户中查看询价并提交报价</li>
            <li>您可以在询价页面查看各供应商的报价情况</li>
            <li>所有供应商报价后，可进行比价并选择供应商</li>
          </ol>
        </div>
      </Form>
    </Modal>
  );
};

export default SendInquiryModal;
