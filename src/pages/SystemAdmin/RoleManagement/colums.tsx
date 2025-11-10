import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { ModalControl } from '@/hooks/useModalControl';
import { RoleInfo } from '@/services/role/typings';
import { ColumnsProps } from '@/types/common';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import { Divider, Tag } from 'antd';

export const getColumns = (props: ColumnsProps<RoleInfo>) => {
  const { handleModalOpen, changeStatusModal, createOrModifyModal } = props;

  return [
    {
      title: '角色key',
      dataIndex: 'role_key',
    },
    {
      title: '角色名称',
      dataIndex: 'role_name',
    },
    {
      title: '角色类型',
      dataIndex: 'role_type',
    },
    {
      title: '角色状态',
      dataIndex: 'status',
      render: (_: any, record: RoleInfo) => {
        const statusValue = resolveCommonStatus(record.status);
        const meta = getStatusMeta(statusValue, {
          [COMMON_STATUS.DELETED]: { text: '已停用' },
        });
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
    },
    {
      title: '更新时间',
      dataIndex: 'modify_time',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: RoleInfo) => (
        <>
          <a
            onClick={() =>
              handleModalOpen(changeStatusModal as ModalControl, record)
            }
          >
            {record.status.code === COMMON_STATUS_CODE.ACTIVE
              ? '停用角色'
              : '恢复角色'}
          </a>
          <Divider type="vertical" />
          <a onClick={() => handleModalOpen(createOrModifyModal, record)}>
            修改角色信息
          </a>
        </>
      ),
    },
  ];
};
