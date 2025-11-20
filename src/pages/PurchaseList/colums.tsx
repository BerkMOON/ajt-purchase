import { ModalControl } from '@/hooks/useModalControl';
import { PurchaseItem } from '@/services/purchase/typings';
import { ColumnsProps } from '@/types/common';
import { Link } from '@umijs/max';
import { Button, Divider, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface PurchaseColumnsProps extends ColumnsProps<PurchaseItem> {
  onSubmit?: (record: PurchaseItem) => void;
  isDraft?: boolean; // 是否是草稿列表
}

export const getColumns = (props: PurchaseColumnsProps) => {
  const {
    handleModalOpen,
    deleteModal,
    createOrModifyModal,
    onSubmit,
    isDraft = false,
  } = props;

  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return 'default'; // 草稿
      case 2:
        return 'warning'; // 待询价
      case 3:
        return 'blue'; // 已报价
      case 4:
        return 'orange'; // 价格待审批
      case 5:
        return 'purple'; // 已下单
      case 6:
        return 'success'; // 已到货
      default:
        return 'default';
    }
  };

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
      dataIndex: 'create_time',
      key: 'create_time',
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
      render: (status: { code: number; name: string }) => (
        <Tag color={getStatusColor(status.code)}>{status.name}</Tag>
      ),
    },
    {
      title: '期望到货日期',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: PurchaseItem) => {
        if (isDraft) {
          // 草稿列表：全部都是草稿状态，都可以编辑、删除、提交
          return (
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
                onClick={() => onSubmit?.(record)}
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
          );
        } else {
          // 正式列表：只显示查看详情
          return (
            <Link to={`/purchase/${record.order_no}`}>
              <Button type="link">查看详情</Button>
            </Link>
          );
        }
      },
    },
  ] as ColumnsType<PurchaseItem>;
};
