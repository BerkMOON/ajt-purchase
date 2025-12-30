import type { PurchaseOrderItemResponse } from '@/services/purchase/typings.d';
import { Checkbox, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { OrderItemStatus } from '../constants';

interface ConfirmOrderModalProps {
  visible: boolean;
  items: PurchaseOrderItemResponse[];
  onOk: (skuIdList: number[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({
  visible,
  items,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // 当弹窗打开时，重置选择
  useEffect(() => {
    if (visible) {
      setSelectedItems(new Set());
    }
  }, [visible]);

  // 只显示状态为"已选中"的商品（可以下单的商品）
  const availableItems = items.filter(
    (item) => item.status.code === OrderItemStatus.SELECTED,
  );

  const handleToggleItem = (skuId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(skuId)) {
      newSelected.delete(skuId);
    } else {
      newSelected.add(skuId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === availableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableItems.map((item) => item.sku_id)));
    }
  };

  const handleOk = () => {
    if (selectedItems.size === 0) {
      return;
    }

    const skuIdList = Array.from(selectedItems);
    onOk(skuIdList);
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
        />
      ),
      key: 'select',
      width: 100,
      render: (_: any, record: PurchaseOrderItemResponse) => {
        return (
          <Checkbox
            checked={selectedItems.has(record.sku_id)}
            onChange={() => handleToggleItem(record.sku_id)}
          />
        );
      },
    },
    {
      title: '产品编码',
      dataIndex: 'third_code',
      key: 'third_code',
      width: 200,
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
  ];

  return (
    <Modal
      title="下单"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="确认下单"
      cancelText="取消"
      confirmLoading={loading}
      okButtonProps={{
        disabled: selectedItems.size === 0,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#666' }}>
          请选择需要下单的商品，确认后将提交订单。
        </span>
      </div>
      <Table
        columns={columns}
        dataSource={availableItems}
        rowKey="sku_id"
        pagination={false}
        size="small"
        locale={{
          emptyText: '没有可下单的商品',
        }}
      />
    </Modal>
  );
};

export default ConfirmOrderModal;
