import { AccessoryInfo, PartsInfo } from '@/services/purchase/typings.d';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Table,
  Tag,
} from 'antd';
import { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import React from 'react';

interface CreatePurchaseModalProps {
  visible: boolean;
  loading: boolean;
  form: FormInstance;
  selectedItems: (PartsInfo | AccessoryInfo)[];
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
  const columns = [
    { title: '编码', dataIndex: 'part_code', width: 100 },
    { title: '名称', dataIndex: 'part_name', width: 150 },
    { title: '规格', dataIndex: 'specification', width: 120 },
    {
      title: '类型',
      key: 'category_type',
      width: 80,
      render: () => <Tag color="blue">备件</Tag>,
    },
    {
      title: '数量',
      key: 'quantity',
      width: 100,
      render: (_: any, record: PartsInfo | AccessoryInfo) => (
        <Form.Item
          name={['quantities', record.part_id]}
          initialValue={1}
          style={{ margin: 0 }}
          rules={[
            { required: true, message: '请输入数量' },
            { type: 'number', min: 1, message: '数量不能小于1' },
          ]}
        >
          <InputNumber min={1} max={999} size="small" style={{ width: 70 }} />
        </Form.Item>
      ),
    },
    {
      title: '单价',
      key: 'price',
      width: 100,
      render: (_: any, record: PartsInfo | AccessoryInfo) => {
        const part = record as PartsInfo;
        return part.historical_avg_price ? (
          <span>¥{part.historical_avg_price.toFixed(2)}</span>
        ) : (
          <Tag color="warning">待询价</Tag>
        );
      },
    },
    {
      title: '供应商',
      key: 'supplier',
      width: 120,
      render: () => <Tag color="blue">待选择</Tag>,
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
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={3} placeholder="请输入备注信息（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <h4>配件清单</h4>
          <Table
            dataSource={selectedItems}
            rowKey="part_id"
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
