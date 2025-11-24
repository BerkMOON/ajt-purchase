import type { PurchaseDetailItem } from '@/services/purchase/typings.d';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { formatCurrency } from '../utils';

interface PartListCardProps {
  items?: PurchaseDetailItem[];
}

const columns: ColumnsType<PurchaseDetailItem> = [
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
  },
  {
    title: 'SKU ID',
    dataIndex: 'sku_id',
    key: 'sku_id',
  },
  {
    title: '配件名称',
    dataIndex: 'product_name',
    key: 'product_name',
  },
  {
    title: '采购数量',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: '采购均价',
    dataIndex: 'avg_price',
    key: 'avg_price',
    render: (price?: number) => formatCurrency(price),
  },
  {
    title: '选择供应商',
    dataIndex: 'selected_supplier_name',
    key: 'selected_supplier_name',
    render: (name?: string) =>
      name ? (
        <Tag color="success">{name}</Tag>
      ) : (
        <span style={{ color: '#bfbfbf' }}>未选择</span>
      ),
  },
  {
    title: '实际价格',
    dataIndex: 'actual_price',
    key: 'actual_price',
    render: (price?: number) => formatCurrency(price),
  },
  {
    title: '实际总价',
    dataIndex: 'actual_total_price',
    key: 'actual_total_price',
    render: (price?: number) => formatCurrency(price),
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    render: (text?: string) => text || '-',
  },
];

const PartListCard: React.FC<PartListCardProps> = ({ items }) => (
  <Card title="配件清单" size="small">
    <Table
      columns={columns}
      dataSource={items}
      rowKey={(item) => item.id || `${item.sku_id}-${item.product_name}`}
      pagination={false}
      size="small"
    />
  </Card>
);

export default PartListCard;
