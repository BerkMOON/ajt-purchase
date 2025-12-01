import { Modal, Tag } from 'antd';
import React from 'react';
import type { ItemQuoteRow, SelectedSupplierMap } from '../utils';

interface SelectSupplierModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  selectedSuppliers: SelectedSupplierMap;
  itemQuoteData: ItemQuoteRow[];
}

const SelectSupplierModal: React.FC<SelectSupplierModalProps> = ({
  visible,
  onOk,
  onCancel,
  selectedSuppliers,
  itemQuoteData,
}) => (
  <Modal
    title="确认选择供应商"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    width={600}
  >
    <p>确认以下商品选择的供应商吗？</p>
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      {Object.entries(selectedSuppliers)
        .filter(([, data]) => !!data.quote_no)
        .map(([itemKey, data]) => {
          const itemData = itemQuoteData.find(
            (item) => item.itemKey === itemKey,
          );
          if (!itemData) return null;
          const selectedQuote = itemData.quotes.find(
            (q) => q.quote_no === data.quote_no,
          );
          return (
            <div
              key={itemKey}
              style={{
                marginBottom: 12,
                padding: 8,
                background: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <div>
                <strong>{itemData.sku_name}</strong> (数量: {itemData.quantity})
              </div>
              <div style={{ marginTop: 4 }}>
                选择供应商: <Tag color="success">{data.supplier_name}</Tag>
                {selectedQuote && (
                  <span style={{ marginLeft: 8 }}>
                    报价: ¥{selectedQuote.quote_price.toFixed(2)} ×{' '}
                    {itemData.quantity} = ¥
                    {selectedQuote.total_price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </div>
    <p style={{ color: '#999', fontSize: 12 }}>
      选择后系统将自动进行价格阈值检查，如需审批将进入价格审批流程，否则直接生成采购订单。
    </p>
  </Modal>
);

export default SelectSupplierModal;
