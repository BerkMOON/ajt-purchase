import type {
  PurchaseOrderItemResponse,
  UpdatePurchaseItemParams,
} from '@/services/purchase/typings.d';
import { InputNumber, Modal, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';

interface EditableItem {
  id: number;
  sku_id: number;
  sku_name: string;
  quantity: number;
  purchase_type: string;
  third_code?: string;
}

interface EditPurchaseItemsModalProps {
  visible: boolean;
  orderNo: number;
  items: PurchaseOrderItemResponse[];
  loading?: boolean;
  onOk: (params: UpdatePurchaseItemParams[]) => void;
  onCancel: () => void;
}

const EditPurchaseItemsModal: React.FC<EditPurchaseItemsModalProps> = ({
  visible,
  orderNo,
  items,
  loading = false,
  onOk,
  onCancel,
}) => {
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [initialMap, setInitialMap] = useState<Record<number, EditableItem>>(
    {},
  );

  useEffect(() => {
    if (!visible) return;
    const normalized = items.map((item) => ({
      id: item.id,
      sku_id: item.sku_id,
      sku_name: item.sku_name,
      quantity: item.quantity || 1,
      purchase_type: item.purchase_type || 'normal',
      third_code: (item as any).third_code,
    }));
    setEditableItems(normalized);
    const map: Record<number, EditableItem> = {};
    normalized.forEach((item) => {
      map[item.sku_id] = { ...item };
    });
    setInitialMap(map);
  }, [visible, items]);

  const updateField = (
    skuId: number,
    key: 'quantity' | 'purchase_type',
    value: number | string,
  ) => {
    setEditableItems((prev) =>
      prev.map((item) =>
        item.sku_id === skuId ? { ...item, [key]: value } : item,
      ),
    );
  };

  const changedParams = useMemo(() => {
    return editableItems
      .filter((item) => {
        const initial = initialMap[item.sku_id];
        if (!initial) return false;
        return (
          Number(item.quantity) !== Number(initial.quantity) ||
          item.purchase_type !== initial.purchase_type
        );
      })
      .map((item) => ({
        order_no: orderNo,
        sku_id: item.sku_id,
        quantity: Number(item.quantity),
        purchase_type: item.purchase_type,
      }));
  }, [editableItems, initialMap, orderNo]);

  const columns: ColumnsType<EditableItem> = [
    {
      title: '产品编码',
      dataIndex: 'third_code',
      key: 'third_code',
      width: 180,
      render: (value: string, record) => value || record.sku_id,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
    },
    {
      title: '数量',
      key: 'quantity',
      width: 130,
      render: (_: any, record: EditableItem) => (
        <InputNumber
          min={1}
          max={999999}
          value={record.quantity}
          onChange={(value) =>
            updateField(record.sku_id, 'quantity', value || 1)
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '采购类型',
      key: 'purchase_type',
      width: 150,
      render: (_: any, record: EditableItem) => (
        <Select
          value={record.purchase_type}
          onChange={(value) =>
            updateField(record.sku_id, 'purchase_type', value)
          }
          options={[
            { label: '普通采购', value: 'normal' },
            { label: '回采', value: 'return' },
          ]}
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  return (
    <Modal
      title="修改商品信息"
      open={visible}
      onOk={() => onOk(changedParams)}
      onCancel={onCancel}
      width={900}
      okText="确认修改"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Table
        dataSource={editableItems}
        rowKey="sku_id"
        columns={columns}
        pagination={false}
        size="small"
      />
    </Modal>
  );
};

export default EditPurchaseItemsModal;
