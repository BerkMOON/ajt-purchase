import PurchaseStoreSelect from '@/components/BusinessComponents/PurchaseStoreSelect';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tag,
} from 'antd';
import { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import type { CartItem } from '../hooks/useCart';

interface CreatePurchaseModalProps {
  visible: boolean;
  loading: boolean;
  form: FormInstance;
  selectedItems: CartItem[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
  visible,
  loading,
  form,
  selectedItems,
  onCancel,
  onSubmit,
}) => {
  // 初始化表单值
  useEffect(() => {
    if (visible) {
      // 初始化数量表单值
      const initialQuantities: Record<number, number> = {};
      selectedItems.forEach((item) => {
        if (item.sku_id !== undefined && item.sku_id !== null) {
          initialQuantities[item.sku_id] = 1;
        }
      });
      form.setFieldsValue({
        quantities: initialQuantities,
        expected_delivery_date: dayjs().add(7, 'days'),
        inquiry_deadline: dayjs().add(30, 'minutes'),
        remark: '',
      });
    } else {
      // 关闭弹窗时重置表单
      form.resetFields();
    }
  }, [visible, form, selectedItems]);

  const columns = [
    {
      title: 'SKU ID',
      dataIndex: 'sku_id',
      key: 'sku_id',
      width: 100,
    },
    {
      title: 'SKU 名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 150,
    },
    {
      title: '销售属性',
      key: 'attr_pairs',
      width: 200,
      render: (_: any, record: CartItem) => {
        if (!record.attr_pairs || record.attr_pairs.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Space wrap>
            {record.attr_pairs.map((pair, index) => (
              <Tag key={index} color="blue">
                {pair.attr_name || pair.attr_code || ''}:{' '}
                {pair.value_name || pair.value_code || ''}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '数量',
      key: 'quantity',
      width: 100,
      render: (_: any, record: CartItem) => {
        // 确保 sku_id 存在
        if (record.sku_id === undefined || record.sku_id === null) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Form.Item
            name={['quantities', record.sku_id]}
            style={{ margin: 0 }}
            rules={[
              { required: true, message: '请输入数量' },
              { type: 'number', min: 1, message: '数量不能小于1' },
            ]}
          >
            <InputNumber min={1} max={999} size="small" style={{ width: 70 }} />
          </Form.Item>
        );
      },
    },
  ];

  return (
    <Modal
      title="创建采购单"
      open={visible}
      onCancel={onCancel}
      width={1000}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          创建采购单
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="store_id"
              label="采购门店"
              rules={[{ required: true, message: '请选择采购门店' }]}
            >
              <PurchaseStoreSelect form={form} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="期望到货日期"
              name="expected_delivery_date"
              rules={[{ required: true, message: '请选择期望到货日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="询价截止时间"
              name="inquiry_deadline"
              rules={[{ required: true, message: '请选择询价截止时间' }]}
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
          </Col>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={3} placeholder="请输入备注信息（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <h4>SKU清单</h4>
          <Table
            dataSource={selectedItems}
            rowKey="sku_id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
            columns={columns}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseModal;
