import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { ModalControl } from '@/hooks/useModalControl';
import type { BrandDetailResponse } from '@/services/system/brand/typings';
import { ColumnsProps } from '@/types/common';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';

export const getColumns = (props: ColumnsProps<BrandDetailResponse>): any[] => {
  const { handleModalOpen, changeStatusModal, createOrModifyModal } = props;

  return [
    {
      title: '品牌ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '品牌名称',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
    },
    {
      title: '更新时间',
      dataIndex: 'modify_time',
      key: 'modify_time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: BrandDetailResponse) => {
        const statusValue = resolveCommonStatus(record.status);
        const meta = getStatusMeta(statusValue, {
          [COMMON_STATUS.DELETED]: { text: '已停用' },
        });
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_: any, record: BrandDetailResponse) => {
        const isActive = record.status?.code === COMMON_STATUS_CODE.ACTIVE;
        return (
          <>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleModalOpen(createOrModifyModal, record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              icon={
                isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />
              }
              onClick={() =>
                handleModalOpen(changeStatusModal as ModalControl, record)
              }
            >
              {record.status?.code === COMMON_STATUS_CODE.ACTIVE
                ? '停用品牌'
                : '启用品牌'}
            </Button>
          </>
        );
      },
    },
  ];
};
