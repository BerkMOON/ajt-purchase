import type {
  PurchaseOrderItemResponse,
  SkuList,
} from '@/services/purchase/typings.d';
import { StatusInfo } from '@/types/common';
import { formatPriceToYuan } from '@/utils/prince';
import { Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo } from 'react';
import { OrderItemStatus, OrderItemStatusColorMap } from '../constants';
import { formatDate } from '../utils';

interface PartListCardProps {
  items?: PurchaseOrderItemResponse[];
  quotes?: SkuList[]; // 报价数据，用于获取物流信息
}

const columns: ColumnsType<PurchaseOrderItemResponse> = [
  {
    title: '产品编码',
    dataIndex: 'third_code',
    key: 'third_code',
    width: 200,
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
    render: (status?: StatusInfo<OrderItemStatus>) =>
      status ? (
        <Tag color={OrderItemStatusColorMap[status.code]}>{status.name}</Tag>
      ) : (
        '-'
      ),
  },
  {
    title: '采购类型',
    dataIndex: 'purchase_type',
    key: 'purchase_type',
  },
  {
    title: '采购最高限价',
    dataIndex: 'limit_price',
    key: 'limit_price',
    render: (price?: number) => formatPriceToYuan(price),
  },
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
    title: '报价价格',
    dataIndex: 'quote_price',
    key: 'quote_price',
    render: (price?: number) => formatPriceToYuan(price),
  },
  {
    title: '报价总价',
    dataIndex: 'total_price',
    key: 'total_price',
    render: (price?: number) => formatPriceToYuan(price),
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

const PartListCard: React.FC<PartListCardProps> = ({
  items = [],
  quotes = [],
}) => {
  // 构建一个映射：itemKey (基于 id 或 sku_id+sku_name) -> tracking_info
  // 根据 item.id 或 sku_id + quote_no 来匹配对应的报价项的物流信息
  const trackingInfoMap = useMemo(() => {
    const map = new Map<
      string,
      { tracking_no_list: string[]; remark: string }
    >();

    if (!items || !quotes) return map;

    items.forEach((item) => {
      if (item.supplier_name && item.quote_no) {
        // 找到对应的 SKU 报价
        const skuQuote = quotes.find((q) => q.sku_id === item.sku_id);
        if (skuQuote) {
          // 找到对应 quote_no 的报价项
          const quoteItem = skuQuote.quote_items.find(
            (qi) => String(qi.quote_no) === String(item.quote_no),
          );
          if (quoteItem?.tracking_info) {
            // 使用 itemKey 作为 map 的 key，确保唯一性
            const itemKey = item.id
              ? `order_${item.id}`
              : `sku_${item.sku_id}_${item.sku_name}`;
            map.set(itemKey, quoteItem.tracking_info);
          }
        }
      }
    });

    return map;
  }, [items, quotes]);

  const columnsWithTracking: ColumnsType<PurchaseOrderItemResponse> = [
    ...columns,
    {
      title: '物流信息',
      key: 'tracking_info',
      width: 250,
      render: (_: any, record: PurchaseOrderItemResponse) => {
        // 构建 itemKey 用于查找物流信息
        const itemKey = record.id
          ? `order_${record.id}`
          : `sku_${String(record.sku_id)}_${record.sku_name}`;
        const trackingInfo = trackingInfoMap.get(itemKey);
        if (!trackingInfo) {
          return <span style={{ color: '#bfbfbf' }}>-</span>;
        }

        const { tracking_no_list, remark } = trackingInfo;

        return (
          <div>
            {tracking_no_list && tracking_no_list.length > 0 && (
              <div style={{ marginBottom: remark ? 8 : 0 }}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>
                  快递单号：
                </div>
                <Space wrap>
                  {tracking_no_list.map((trackingNo: string, index: number) => (
                    <Tag key={index} color="blue">
                      {trackingNo}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
            {remark && (
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>备注：</div>
                <div style={{ color: '#666', fontSize: '12px' }}>{remark}</div>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card title="配件清单" size="small">
      <Table
        columns={columnsWithTracking}
        dataSource={items}
        rowKey={(item) => `${item.id}-${item.sku_id}-${item.sku_name}`}
        pagination={false}
        scroll={{ x: 1600 }}
        size="small"
      />
    </Card>
  );
};

export default PartListCard;
