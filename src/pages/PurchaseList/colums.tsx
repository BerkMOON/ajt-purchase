import { ModalControl } from '@/hooks/useModalControl';
import { PurchaseItem } from '@/services/purchase/typings';
import { ColumnsProps } from '@/types/common';
import { Link } from '@umijs/max';
import { Button, Divider, Tag } from 'antd';

export interface PurchaseColumnsProps extends ColumnsProps<PurchaseItem> {
  onSubmit?: (record: PurchaseItem) => void;
}

export const getColumns = (props: PurchaseColumnsProps) => {
  const { handleModalOpen, deleteModal, createOrModifyModal, onSubmit } = props;

  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return 'default'; // 草稿
      case 2:
        return 'processing'; // 待审核
      case 3:
        return 'success'; // 审核通过
      case 4:
        return 'error'; // 已驳回
      case 5:
        return 'warning'; // 待询价
      case 6:
        return 'blue'; // 已报价
      case 7:
        return 'purple'; // 已下单
      case 8:
        return 'green'; // 已完成
      default:
        return 'default';
    }
  };

  return [
    {
      title: '采购单号',
      dataIndex: 'purchase_no',
      key: 'purchase_no',
      render: (text: string, record: PurchaseItem) => (
        <Link to={`/purchase/${record.id}`}>{text}</Link>
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
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `¥${amount?.toFixed(2) || '0.00'}`,
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
      render: (_: any, record: PurchaseItem) => {
        const canEdit = record.status.code === 1; // 只有草稿状态可以编辑
        const canDelete = record.status.code === 1; // 只有草稿状态可以删除
        const canSubmit = record.status.code === 1; // 只有草稿状态可以提交

        return (
          <>
            {canEdit && (
              <>
                <Button
                  type="link"
                  onClick={() => handleModalOpen(createOrModifyModal, record)}
                >
                  修改
                </Button>
                <Divider type="vertical" />
              </>
            )}
            {canSubmit && (
              <>
                <Button type="link" onClick={() => onSubmit?.(record)}>
                  提交
                </Button>
                <Divider type="vertical" />
              </>
            )}
            {canDelete && (
              <Button
                type="link"
                onClick={() =>
                  handleModalOpen(deleteModal as ModalControl, record)
                }
              >
                删除
              </Button>
            )}
          </>
        );
      },
    },
  ];
};
