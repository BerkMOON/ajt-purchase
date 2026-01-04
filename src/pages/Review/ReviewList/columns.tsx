import type { PendingApprovalQuotesInfo } from '@/services/system/review/typings';
import { formatPriceToYuan } from '@/utils/prince';
import { history } from '@umijs/max';
import { Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '../../PurchaseDetail/utils';

export const getColumns = (): ColumnsType<PendingApprovalQuotesInfo> => [
  {
    title: '报价单号',
    dataIndex: 'quote_no',
    key: 'quote_no',
    width: 150,
  },
  {
    title: '采购单号',
    dataIndex: 'order_no',
    key: 'order_no',
    width: 150,
  },
  {
    title: 'SKU名称',
    dataIndex: 'sku_name',
    key: 'sku_name',
    ellipsis: true,
  },
  {
    title: '报价金额',
    dataIndex: 'quote_price',
    key: 'quote_price',
    width: 120,
    align: 'right',
    render: (price: number) => formatPriceToYuan(price),
  },
  {
    title: '采购数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
    align: 'right',
  },
  {
    title: '采购总金额',
    dataIndex: 'total_price',
    key: 'total_price',
    width: 120,
    align: 'right',
    render: (price: number) => formatPriceToYuan(price),
  },
  {
    title: '报价状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status: { code: number; name: string }) => (
      <Tag color="orange">{status?.name || '待审批'}</Tag>
    ),
  },
  {
    title: '报价时间',
    dataIndex: 'submit_time',
    key: 'submit_time',
    width: 180,
    render: (time: string) => formatDate(time),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right' as const,
    render: (_: any, record: PendingApprovalQuotesInfo) => (
      <Button
        type="link"
        size="small"
        onClick={() => {
          history.push(`/review/detail/${record.quote_no}`);
        }}
      >
        查看详情
      </Button>
    ),
  },
];
