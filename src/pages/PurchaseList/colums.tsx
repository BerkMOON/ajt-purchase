import CountdownText from '@/components/BasicComponents/CountdownText';
import { PurchaseItem } from '@/services/purchase/typings';
import { StatusInfo } from '@/types/common';
import { Link } from '@umijs/max';
import { Button, Tag } from 'antd';
import { OrderStatus } from '../PurchaseDetail/constants';
import { formatDate, PurchaseStatusColorMap } from '../PurchaseDetail/utils';

export const columns = [
  {
    title: '采购单号',
    dataIndex: 'order_no',
    key: 'order_no',
    render: (text: string, record: PurchaseItem) => (
      <Link to={`/purchase/${record.order_no}`}>{text}</Link>
    ),
  },
  {
    title: '创建日期',
    dataIndex: 'ctime',
    key: 'ctime',
    render: (text: string) => formatDate(text),
  },
  {
    title: '采购门店',
    dataIndex: 'store_name',
    key: 'store_name',
  },
  {
    title: '采购人',
    dataIndex: 'creator_name',
    key: 'creator_name',
  },
  {
    title: '当前状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: StatusInfo<keyof typeof PurchaseStatusColorMap>) => (
      <Tag color={PurchaseStatusColorMap[status.code]}>{status.name}</Tag>
    ),
  },
  {
    title: '期望到货日期',
    dataIndex: 'expected_delivery_date',
    key: 'expected_delivery_date',
  },
  {
    title: '询价截止时间',
    dataIndex: 'inquiry_deadline',
    key: 'inquiry_deadline',
    render: (deadline: string, record: PurchaseItem) => {
      const expired =
        new Date(deadline) < new Date() &&
        record.status.code === OrderStatus.INQUIRING;
      return (
        <span style={{ color: expired ? 'red' : 'inherit' }}>
          <CountdownText
            deadline={deadline}
            isInquiring={record.status.code === OrderStatus.INQUIRING}
          />
        </span>
      );
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 250,
    fixed: 'right' as const,
    render: (_: any, record: PurchaseItem) => (
      <Link to={`/purchase/${record.order_no}`}>
        <Button type="link">查看详情</Button>
      </Link>
    ),
  },
];
