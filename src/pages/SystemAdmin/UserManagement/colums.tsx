import { COMMON_STATUS, COMMON_STATUS_CODE, Role } from '@/constants';
import { ModalControl } from '@/hooks/useModalControl';
import { UserInfo } from '@/services/System/user/typings';
import { ColumnsProps } from '@/types/common';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import { Divider, Tag } from 'antd';

export const getColumns = (props: ColumnsProps<UserInfo>) => {
  const {
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
    resetPasswordModal,
    changeRoleModal,
    bindingModal,
  } = props;

  return [
    {
      title: '账号',
      dataIndex: 'username',
    },
    {
      title: '用户姓名',
      dataIndex: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },
    {
      title: '角色类型',
      dataIndex: 'user_type_name',
    },
    {
      title: '角色',
      dataIndex: 'role_name',
    },
    {
      title: '供应商名称',
      dataIndex: 'supplier_name',
      render: (_: any, record: UserInfo) => {
        return record.user_type === Role.Supplier ? record.supplier_name : null;
      },
    },
    {
      title: '公司名称',
      dataIndex: 'company_name',
      render: (_: any, record: UserInfo) => {
        return record.user_type === Role.Store ? record.company_name : null;
      },
    },
    {
      title: '门店名称',
      dataIndex: 'store_name',
      render: (_: any, record: UserInfo) => {
        return record.user_type === Role.Store ? record.store_name : null;
      },
    },
    {
      title: '用户状态',
      dataIndex: 'status',
      render: (_: any, record: UserInfo) => {
        const statusValue = resolveCommonStatus(record.status);
        const meta = getStatusMeta(statusValue, {
          [COMMON_STATUS.DELETED]: { text: '已删除' },
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
      render: (_: unknown, record: UserInfo) => (
        <>
          <a
            onClick={() =>
              handleModalOpen(changeStatusModal as ModalControl, record)
            }
          >
            {record.status.code === COMMON_STATUS_CODE.ACTIVE
              ? '停用用户'
              : '恢复用户'}
          </a>
          <Divider type="vertical" />
          <a onClick={() => handleModalOpen(createOrModifyModal, record)}>
            修改用户信息
          </a>
          <Divider type="vertical" />
          <a
            onClick={() =>
              handleModalOpen(changeRoleModal as ModalControl, record)
            }
          >
            修改用户角色
          </a>
          <Divider type="vertical" />
          <a
            onClick={() =>
              handleModalOpen(resetPasswordModal as ModalControl, record)
            }
          >
            修改密码
          </a>
          {[Role.Store, Role.Supplier].includes(record.user_type as Role) &&
          bindingModal ? (
            <>
              <Divider type="vertical" />
              <a
                onClick={() =>
                  handleModalOpen(bindingModal as ModalControl, record)
                }
              >
                {record.user_type === Role.Supplier
                  ? '修改供应商绑定'
                  : '修改门店绑定'}
              </a>
            </>
          ) : null}
        </>
      ),
    },
  ];
};
