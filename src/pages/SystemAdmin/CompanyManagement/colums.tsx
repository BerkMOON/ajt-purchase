import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { ModalControl } from '@/hooks/useModalControl';
import { CompanyItem } from '@/services/company/typing';
import { ColumnsProps } from '@/types/common';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import { Button, Divider, Tag } from 'antd';

export const getColumns = (props: ColumnsProps<CompanyItem>) => {
  const { handleModalOpen, changeStatusModal, createOrModifyModal } = props;

  return [
    {
      title: '公司ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '公司名称',
      dataIndex: 'company_name',
      key: 'company_name',
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
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: CompanyItem) => {
        const statusValue = resolveCommonStatus(record.status);
        const meta = getStatusMeta(statusValue, {
          [COMMON_STATUS.DELETED]: { text: '已失效' },
        });
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CompanyItem) => (
        <>
          <Button
            type="link"
            onClick={() => handleModalOpen(createOrModifyModal, record)}
          >
            修改公司信息
          </Button>
          <Divider type="vertical" />
          <a
            onClick={() =>
              handleModalOpen(changeStatusModal as ModalControl, record)
            }
          >
            {record.status.code === COMMON_STATUS_CODE.ACTIVE
              ? '停用公司'
              : '恢复公司'}
          </a>
        </>
      ),
    },
  ];
};
