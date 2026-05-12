import type {
  PurchaseOrderDetailResponse,
  PurchaseOrderItemResponse,
} from '@/services/purchase/typings.d';
import { Button, message } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { OrderItemStatus } from '../constants';
import PrintOutboundModal from './PrintOutboundModal';

interface PrintOutboundActionProps {
  purchase: PurchaseOrderDetailResponse;
  disabled?: boolean;
}

const PrintOutboundAction: React.FC<PrintOutboundActionProps> = ({
  purchase,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  const handleOpen = () => {
    if (disabled) return;
    const hasArrivedItems = purchase.items?.some(
      (item) => item.status.code === OrderItemStatus.ARRIVED,
    );
    if (!hasArrivedItems) {
      message.warning('没有已到货商品，无法打印出库单');
      return;
    }
    setVisible(true);
  };

  const handleExport = (selectedItems: PurchaseOrderItemResponse[]) => {
    if (selectedItems.length === 0) return;

    const supplierSet = new Set(
      selectedItems.map((item) => item.supplier_name).filter(Boolean),
    );
    const supplierText =
      supplierSet.size === 1
        ? Array.from(supplierSet)[0]
        : `多供应商(${supplierSet.size})`;

    const rows: (string | number | null)[][] = [
      [null, null, `供货商名称：${supplierText}`],
      [
        '客户名称：',
        purchase.store_name || '-',
        null,
        null,
        '销售单编号：',
        dayjs().format('YYYY/MM/DD') + '-' + String(purchase.order_no),
      ],
      ['序号', '产品编码', '配件名称', '采购数量', '采购单价', '金额'],
    ];

    let totalAmount = 0;
    selectedItems.forEach((item, index) => {
      const unitPrice = item.quote_price
        ? Number((item.quote_price / 100).toFixed(2))
        : 0;
      const amount = Number((unitPrice * (item.quantity || 0)).toFixed(2));
      totalAmount += amount;

      rows.push([
        index + 1,
        (item as any).third_code || String(item.sku_id),
        item.sku_name || '',
        item.quantity || 0,
        unitPrice,
        amount,
      ]);
    });

    rows.push([null, null, null, null, '合计', Number(totalAmount.toFixed(2))]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
    ];
    ws['!merges'] = [
      XLSX.utils.decode_range('C1:F1'),
      XLSX.utils.decode_range('B2:D2'),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '出库单');
    const fileName = `出库单_${purchase.order_no}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success('出库单已导出');
    setVisible(false);
  };

  return (
    <>
      <Button onClick={handleOpen} disabled={disabled}>
        打印出库单
      </Button>
      <PrintOutboundModal
        visible={visible}
        items={purchase.items || []}
        onOk={handleExport}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};

export default PrintOutboundAction;
