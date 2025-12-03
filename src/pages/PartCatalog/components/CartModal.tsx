import { Button, Modal, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import type { CartItem } from '../hooks/useCart';

interface CartModalProps {
  visible: boolean;
  items: CartItem[];
  onCancel: () => void;
  onCreatePurchase: () => void;
  onRemoveItem: (skuId: number) => void;
}

const CartModal: React.FC<CartModalProps> = ({
  visible,
  items,
  onCancel,
  onCreatePurchase,
  onRemoveItem,
}) => {
  const cartColumns: ColumnsType<CartItem> = [
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
      width: 200,
    },
    {
      title: '销售属性',
      key: 'attr_pairs',
      width: 250,
      render: (_, record) => {
        if (!record.attr_pairs || record.attr_pairs.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <>
            {record.attr_pairs.map((pair, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                {pair.attr_name || pair.attr_code || ''}:{' '}
                {pair.value_name || pair.value_code || ''}
              </Tag>
            ))}
          </>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          onClick={() => record.sku_id && onRemoveItem(record.sku_id)}
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
        rowKey="sku_id"
        pagination={false}
        size="small"
        columns={cartColumns}
      />
    </Modal>
  );
};

export default CartModal;
