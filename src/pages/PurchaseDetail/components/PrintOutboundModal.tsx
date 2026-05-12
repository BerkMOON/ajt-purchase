import type { PurchaseOrderItemResponse } from '@/services/purchase/typings.d';
import { Checkbox, Modal, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { OrderItemStatus, OrderItemStatusColorMap } from '../constants';

interface PrintOutboundModalProps {
  visible: boolean;
  items: PurchaseOrderItemResponse[];
  onOk: (selectedItems: PurchaseOrderItemResponse[]) => void;
  onCancel: () => void;
}

const PrintOutboundModal: React.FC<PrintOutboundModalProps> = ({
  visible,
  items,
  onOk,
  onCancel,
}) => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (visible) {
      setSelectedItemIds(new Set());
    }
  }, [visible]);

  const availableItems = items.filter(
    (item) => item.status.code === OrderItemStatus.ARRIVED,
  );

  const handleToggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItemIds.size === availableItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(availableItems.map((item) => item.id)));
    }
  };

  const handleConfirm = () => {
    if (selectedItemIds.size === 0) return;
    const selectedItems = availableItems.filter((item) =>
      selectedItemIds.has(item.id),
    );
    onOk(selectedItems);
    setSelectedItemIds(new Set());
  };

  const columns: ColumnsType<PurchaseOrderItemResponse> = [
    {
      title: (
        <Checkbox
          checked={
            availableItems.length > 0 &&
            selectedItemIds.size === availableItems.length
          }
          indeterminate={
            selectedItemIds.size > 0 &&
            selectedItemIds.size < availableItems.length
          }
          onChange={handleSelectAll}
          disabled={availableItems.length === 0}
        />
      ),
      key: 'select',
      width: 70,
      render: (_: any, record: PurchaseOrderItemResponse) => (
        <Checkbox
          checked={selectedItemIds.has(record.id)}
          onChange={() => handleToggleItem(record.id)}
        />
      ),
    },
    {
      title: '产品编码',
      dataIndex: 'third_code',
      key: 'third_code',
      width: 180,
      render: (_: any, record: PurchaseOrderItemResponse) =>
        (record as any).third_code || record.sku_id,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
    },
    {
      title: '采购数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'center',
    },
    {
      title: '采购单价',
      dataIndex: 'quote_price',
      key: 'quote_price',
      width: 110,
      align: 'right',
      render: (price: number) => (price ? (price / 100).toFixed(2) : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (_: any, record: PurchaseOrderItemResponse) => (
        <Tag color={OrderItemStatusColorMap[record.status.code]}>
          {record.status.name}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title="打印出库单"
      open={visible}
      onOk={handleConfirm}
      onCancel={onCancel}
      width={900}
      okText="导出出库单"
      cancelText="取消"
      okButtonProps={{ disabled: selectedItemIds.size === 0 }}
    >
      <div style={{ marginBottom: 12, color: '#666' }}>
        请选择要打印出库单的商品（仅可选择状态为“已到货”的商品）。
      </div>
      <Table
        columns={columns}
        dataSource={availableItems}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{ emptyText: '暂无可打印的已到货商品' }}
      />
    </Modal>
  );
};

export default PrintOutboundModal;
