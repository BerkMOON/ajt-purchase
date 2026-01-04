import type { ApprovalInfo } from '@/services/system/review/typings';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatDate } from '../../PurchaseDetail/utils';

export const getColumns = (): ColumnsType<ApprovalInfo> => [
  {
    title: '采购单号',
    dataIndex: 'order_no',
    key: 'order_no',
    width: 150,
  },
  {
    title: '报价单号',
    dataIndex: 'quote_no',
    key: 'quote_no',
    width: 150,
  },
  {
    title: '采购商品名称',
    dataIndex: 'sku_name',
    key: 'sku_name',
  },
  {
    title: '第三方编码',
    dataIndex: 'third_code',
    key: 'third_code',
    width: 220,
  },
  {
    title: '审批人',
    dataIndex: 'reviewer_name',
    key: 'reviewer_name',
    width: 120,
  },
  {
    title: '审批结果',
    dataIndex: 'result',
    key: 'result',
  },
  {
    title: '状态变化',
    key: 'status_change',
    width: 200,
    render: (_: any, record: ApprovalInfo) => (
      <span>
        <Tag color="default">{record.from_status?.name || '-'}</Tag>
        <span style={{ margin: '0 8px' }}>→</span>
        <Tag color="blue">{record.to_status?.name || '-'}</Tag>
      </span>
    ),
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    ellipsis: true,
  },
  {
    title: '审批时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180,
    render: (time: string) => formatDate(time),
  },
];
