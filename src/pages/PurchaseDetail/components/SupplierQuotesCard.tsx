import { Button, Card, Empty, Radio, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React from 'react';
import { OrderStatus } from '../constants';
import type { ItemQuoteRow, SelectedSupplierMap } from '../utils';
import { formatCurrency } from '../utils';

interface SupplierQuotesCardProps {
  visible: boolean;
  itemQuoteData: ItemQuoteRow[];
  selectedSuppliers: SelectedSupplierMap;
  onSelectSupplier: (
    itemKey: string,
    quoteNo: string,
    supplierName: string,
    inquiryItemId?: number,
    skuId?: number | string,
    orderItemId?: number,
  ) => void;
  canConfirm: boolean;
  onOpenConfirmModal: () => void;
  purchaseStatus: number;
  selectionEnabled: boolean;
}

const SupplierQuotesCard: React.FC<SupplierQuotesCardProps> = ({
  visible,
  itemQuoteData,
  selectedSuppliers,
  onSelectSupplier,
  canConfirm,
  onOpenConfirmModal,
  purchaseStatus,
  selectionEnabled,
}) => {
  if (!visible) return null;

  const getQuoteColumns = (
    item: ItemQuoteRow,
  ): ColumnsType<ItemQuoteRow['quotes'][number]> => [
    {
      title: '选择',
      key: 'select',
      width: 80,
      align: 'center',
      render: (_: any, quote) => {
        const isSelected =
          selectedSuppliers[item.itemKey]?.quote_no === quote.quote_no;
        return (
          <Radio
            checked={isSelected}
            disabled={!selectionEnabled}
            onChange={() =>
              onSelectSupplier(
                item.itemKey,
                quote.quote_no,
                quote.supplier_name,
                quote.inquiry_item_id,
                quote.sku_id,
                item.order_item_id,
              )
            }
          />
        );
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      width: 200,
      render: (name: string, quote) => {
        const isSelected =
          selectedSuppliers[item.itemKey]?.quote_no === quote.quote_no;
        return <Tag color={isSelected ? 'success' : 'default'}>{name}</Tag>;
      },
    },
    {
      title: '报价单价',
      dataIndex: 'quote_price',
      key: 'quote_price',
      align: 'right',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: '报价小计',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'right',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: '单项交货时间',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      align: 'center',
      render: (val?: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (val?: string) => val || '-',
    },
  ];

  const productColumns: ColumnsType<ItemQuoteRow> = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 220,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: '采购均价',
      dataIndex: 'avg_price',
      key: 'avg_price',
      width: 140,
      align: 'right',
      render: (val?: number) => formatCurrency(val),
    },
    {
      title: '当前选择',
      key: 'selected_supplier',
      width: 200,
      render: (_: any, record: ItemQuoteRow) => {
        const selected = selectedSuppliers[record.itemKey];
        return selected?.supplier_name ? (
          <Tag color="success">{selected.supplier_name}</Tag>
        ) : (
          <span style={{ color: '#bfbfbf' }}>未选择</span>
        );
      },
    },
  ];

  return (
    <Card
      title="供应商报价"
      size="small"
      extra={
        purchaseStatus === OrderStatus.INQUIRING &&
        canConfirm && (
          <Button type="primary" onClick={onOpenConfirmModal}>
            确认选择供应商
          </Button>
        )
      }
    >
      {itemQuoteData.length > 0 ? (
        <Table
          columns={productColumns}
          dataSource={itemQuoteData}
          rowKey="itemKey"
          pagination={false}
          size="small"
          expandable={{
            expandedRowRender: (item) =>
              item.quotes && item.quotes.length > 0 ? (
                <Table
                  columns={getQuoteColumns(item)}
                  dataSource={item.quotes}
                  rowKey="quote_no"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ padding: 12, color: '#999' }}>暂无供应商报价</div>
              ),
            rowExpandable: () => true,
          }}
        />
      ) : (
        <Empty
          description="暂无报价信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default SupplierQuotesCard;
