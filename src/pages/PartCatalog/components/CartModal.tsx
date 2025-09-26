import { AccessoryInfo, PartsInfo } from '@/services/purchase/typings.d';
import { Button, Modal, Table, Tag } from 'antd';
import React from 'react';

interface CartModalProps {
  visible: boolean;
  items: (PartsInfo | AccessoryInfo)[];
  onCancel: () => void;
  onCreatePurchase: () => void;
  onRemoveItem: (partId: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({
  visible,
  items,
  onCancel,
  onCreatePurchase,
  onRemoveItem,
}) => {
  const cartColumns = [
    { title: '编码', dataIndex: 'part_code', width: 120 },
    { title: '名称', dataIndex: 'part_name', width: 150 },
    {
      title: '类型',
      key: 'category_type',
      width: 80,
      render: (_: any, record: PartsInfo | AccessoryInfo) => (
        <Tag color={record.category_type === 'PARTS' ? 'blue' : 'green'}>
          {record.category_type === 'PARTS' ? '备件' : '精品'}
        </Tag>
      ),
    },
    { title: '规格', dataIndex: 'specification', width: 120 },
    {
      title: '品牌',
      dataIndex: 'brand',
      width: 100,
    },
    {
      title: '价格',
      key: 'price',
      width: 100,
      render: (_: any, record: PartsInfo | AccessoryInfo) => {
        if (record.category_type === 'ACCESSORIES') {
          const accessory = record as AccessoryInfo;
          return (
            <span style={{ color: '#f50', fontWeight: 'bold' }}>
              ¥{accessory.fixed_price.toFixed(2)}
            </span>
          );
        } else {
          const part = record as PartsInfo;
          return part.historical_avg_price ? (
            <span>¥{part.historical_avg_price.toFixed(2)}</span>
          ) : (
            <Tag color="warning">待询价</Tag>
          );
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: PartsInfo | AccessoryInfo) => (
        <Button
          type="link"
          danger
          size="small"
          onClick={() => onRemoveItem(record.part_id)}
        >
          移除
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`购物车 (${items.length})`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          继续选购
        </Button>,
        <Button
          key="create"
          type="primary"
          disabled={items.length === 0}
          onClick={onCreatePurchase}
        >
          创建采购单
        </Button>,
      ]}
    >
      <Table
        dataSource={items}
        rowKey="part_id"
        pagination={false}
        size="small"
        columns={cartColumns}
      />
    </Modal>
  );
};

export default CartModal;
