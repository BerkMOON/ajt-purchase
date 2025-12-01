import { ModalControl } from '@/hooks/useModalControl';
import { PurchaseDraftItem, PurchaseItem } from '@/services/purchase/typings';
import { ColumnsProps, StatusInfo } from '@/types/common';
import { Link } from '@umijs/max';
import { Button, Divider, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getPurchaseStatusColor } from '../PurchaseDetail/utils';

interface DraftColumnsProps extends ColumnsProps<PurchaseDraftItem> {
  onSubmit: (record: PurchaseDraftItem) => void;
  isDraft: true;
  deleteModal: ModalControl;
  createOrModifyModal: ModalControl;
}

interface FormalColumnsProps extends ColumnsProps<PurchaseItem> {
  onSubmit?: (record: PurchaseItem) => void;
  isDraft?: false;
  deleteModal?: ModalControl;
  createOrModifyModal: ModalControl;
}

export type PurchaseColumnsProps = DraftColumnsProps | FormalColumnsProps;

export const getColumns = (props: PurchaseColumnsProps) => {
  if (props.isDraft) {
    const { handleModalOpen, deleteModal, createOrModifyModal, onSubmit } =
      props;
    const draftColumns: ColumnsType<PurchaseDraftItem> = [
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
        title: '期望到货日期',
        dataIndex: 'expected_delivery_date',
        key: 'expected_delivery_date',
      },
      {
        title: '询价截止日期',
        dataIndex: 'inquiry_deadline',
        key: 'inquiry_deadline',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: StatusInfo) => (
          <Tag color={getPurchaseStatusColor(status.code)}>{status.name}</Tag>
        ),
      },
      {
        title: '更新时间',
        dataIndex: 'mtime',
        key: 'mtime',
      },
      {
        title: '操作',
        key: 'action',
        width: 250,
        fixed: 'right',
        render: (_: any, record: PurchaseDraftItem) => (
          <>
            <Button
              type="link"
              onClick={() => handleModalOpen(createOrModifyModal, record)}
            >
              编辑
            </Button>
            <Divider type="vertical" />
            <Button
              type="link"
              onClick={() => onSubmit(record)}
              style={{ color: '#52c41a' }}
            >
              提交草稿
            </Button>
            <Divider type="vertical" />
            <Button
              type="link"
              danger
              onClick={() =>
                handleModalOpen(deleteModal as ModalControl, record)
              }
            >
              删除
            </Button>
          </>
        ),
      },
    ];

    return draftColumns as ColumnsType<any>;
  }

  return [
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
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
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
      render: (status: StatusInfo) => (
        <Tag color={getPurchaseStatusColor(status.code)}>{status.name}</Tag>
      ),
    },
    {
      title: '期望到货日期',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
    },
    {
      title: '询价截止日期',
      dataIndex: 'inquiry_deadline',
      key: 'inquiry_deadline',
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
  ] as ColumnsType<PurchaseItem>;
};
