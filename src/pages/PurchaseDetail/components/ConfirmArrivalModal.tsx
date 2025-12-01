import type { PurchaseOrderItemResponse } from '@/services/purchase/typings.d';
import { Checkbox, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { OrderItemStatus } from '../constants';
import { formatCurrency } from '../utils';

interface ConfirmArrivalModalProps {
  visible: boolean;
  items: PurchaseOrderItemResponse[];
  onOk: (selectedQuoteNos: number[]) => void;
  onCancel: () => void;
}

const ConfirmArrivalModal: React.FC<ConfirmArrivalModalProps> = ({
  visible,
  items,
  onOk,
  onCancel,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // 只显示已选中供应商的配件
  const displayItems = items.filter((item) => !!item.supplier_name);

  // 未到货的商品（可选择）
  const availableItems = displayItems.filter(
    (item) => item.status.code !== OrderItemStatus.ARRIVED,
  );

  const handleToggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    // 只选择未到货的商品
    if (selectedItems.size === availableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableItems.map((item) => item.id)));
    }
  };

  const handleOk = () => {
    // 根据选中的配件，找到对应的 quote_no
    const quoteNos: number[] = [];
    selectedItems.forEach((itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item?.quote_no) {
        quoteNos.push(item.quote_no);
      }
    });

    if (quoteNos.length === 0) {
      return;
    }

    onOk(quoteNos);
    setSelectedItems(new Set());
  };

  const handleCancel = () => {
    setSelectedItems(new Set());
    onCancel();
  };

  const columns: ColumnsType<PurchaseOrderItemResponse> = [
    {
      title: (
        <Checkbox
          checked={
            availableItems.length > 0 &&
            selectedItems.size === availableItems.length
          }
          indeterminate={
            selectedItems.size > 0 && selectedItems.size < availableItems.length
          }
          onChange={handleSelectAll}
          disabled={availableItems.length === 0}
        >
          选择
        </Checkbox>
      ),
      key: 'select',
      width: 100,
      render: (_: any, record: PurchaseOrderItemResponse) => {
        const isArrived = record.status.code === OrderItemStatus.ARRIVED;
        return (
          <Checkbox
            checked={selectedItems.has(record.id)}
            onChange={() => handleToggleItem(record.id)}
            disabled={isArrived}
          />
        );
      },
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: '供应商',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: '报价单价',
      dataIndex: 'quote_price',
      key: 'quote_price',
      align: 'right',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '报价小计',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'right',
      render: (price: number) => formatCurrency(price),
    },
  ];

  return (
    <Modal
      title="确认到货"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="确认到货"
      cancelText="取消"
      okButtonProps={{
        disabled: selectedItems.size === 0,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#666' }}>
          请选择已到货的配件，确认后将更新对应配件的到货状态。
        </span>
      </div>
      <Table
        columns={columns}
        dataSource={displayItems}
        rowKey="id"
        pagination={false}
        size="small"
        rowClassName={(record) => {
          const isArrived = record.status.code === OrderItemStatus.ARRIVED;
          return isArrived ? 'arrived-item-disabled' : '';
        }}
      />
    </Modal>
  );
};

export default ConfirmArrivalModal;
