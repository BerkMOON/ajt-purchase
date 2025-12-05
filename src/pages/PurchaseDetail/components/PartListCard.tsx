import type { PurchaseOrderItemResponse } from '@/services/purchase/typings.d';
import { StatusInfo } from '@/types/common';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { formatCurrency, formatDate, getItemStatusColor } from '../utils';

interface PartListCardProps {
  items?: PurchaseOrderItemResponse[];
}

const columns: ColumnsType<PurchaseOrderItemResponse> = [
  {
    title: 'SKU ID',
    dataIndex: 'sku_id',
    key: 'sku_id',
    render: (skuId: number) => String(skuId),
  },
  {
    title: '配件名称',
    dataIndex: 'sku_name',
    key: 'sku_name',
  },
  {
    title: '采购数量',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status?: StatusInfo) =>
      status ? (
        <Tag color={getItemStatusColor(status.code)}>{status.name}</Tag>
      ) : (
        '-'
      ),
  },
  // {
  //   title: '采购均价',
  //   dataIndex: 'avg_price',
  //   key: 'avg_price',
  //   render: (price?: number) => formatCurrency(price),
  // },
  {
    title: '选择供应商',
    dataIndex: 'supplier_name',
    key: 'supplier_name',
    render: (supplier?: string) =>
      supplier ? (
        <Tag color="success">{supplier}</Tag>
      ) : (
        <span style={{ color: '#bfbfbf' }}>未选择</span>
      ),
  },
  {
    title: '实际价格',
    dataIndex: 'quote_price',
    key: 'quote_price',
    render: (price?: number) => formatCurrency(price),
  },
  {
    title: '实际总价',
    dataIndex: 'total_price',
    key: 'total_price',
    render: (price?: number) => formatCurrency(price),
  },
  {
    title: '预计交货日期',
    dataIndex: 'quote_delivery_date',
    key: 'quote_delivery_date',
    render: (date?: string) => formatDate(date),
  },
  {
    title: '到货时间',
    dataIndex: 'delivery_date',
    key: 'delivery_date',
    render: (date?: string) => formatDate(date),
  },
  {
    title: '备注',
    dataIndex: 'quote_remark',
    key: 'quote_remark',
    render: (text?: string) => text || '-',
  },
];

const PartListCard: React.FC<PartListCardProps> = ({ items }) => (
  <Card title="配件清单" size="small">
    <Table
      columns={columns}
      dataSource={items}
      rowKey={(item) => `${item.id}-${item.sku_id}-${item.sku_name}`}
      pagination={false}
      size="small"
    />
  </Card>
);

export default PartListCard;
