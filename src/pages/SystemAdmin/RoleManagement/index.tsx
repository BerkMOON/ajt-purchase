import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { RoleAPI } from '@/services/System/role/RoleController';
import { RoleInfo } from '@/services/System/role/typings';
import { Navigate, useAccess } from '@umijs/max';
import React, { useRef } from 'react';
import BindRoleApisModal from './BindRoleApisModal';
import { getColumns } from './colums';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const DEFAULT_SEARCH_PARAMS = {
  status: COMMON_STATUS.ACTIVE,
};

const TableList: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const createOrModifyModal = useModalControl();
  const changeStatusModal = useModalControl();
  const bindApisModal = useModalControl();
  const [selectedRole, setSelectedRole] = React.useState<RoleInfo | null>(null);

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    role?: RoleInfo,
  ) => {
    if (role) {
      setSelectedRole(role);
    } else {
      setSelectedRole(null);
    }
    modalControl.open();
  };

  const columns = getColumns({
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
    bindApisModal,
  });

  const fetchUserData = async (params: any) => {
    const { data } = await RoleAPI.getRoleList(params);
    return {
      list: data.roles,
      total: data.count.total_count,
    };
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title="角色管理"
        columns={columns}
        searchFormItems={searchForm}
        defaultSearchParams={DEFAULT_SEARCH_PARAMS}
        fetchData={fetchUserData}
        createButton={{
          text: '新建角色',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={changeStatusModal.close}
        refresh={() => baseListRef.current?.getData()}
        params={{
          role_id: selectedRole?.id || '',
          status:
            selectedRole?.status.code === COMMON_STATUS_CODE.ACTIVE
              ? COMMON_STATUS.DELETED
              : COMMON_STATUS.ACTIVE,
        }}
        name="角色状态"
        api={RoleAPI.updateRoleStatus}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedRole(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '角色',
          successMsg: `${selectedRole ? '修改' : '创建'}角色成功`,
        }}
        api={selectedRole ? RoleAPI.updateRole : RoleAPI.createRole}
        record={selectedRole}
        idMapKey="role_id"
        idMapValue="id"
      >
        {createAndModifyForm()}
      </CreateOrModifyForm>
      <BindRoleApisModal
        visible={bindApisModal.visible}
        onCancel={() => {
          bindApisModal.close();
          setSelectedRole(null);
        }}
        roleId={selectedRole?.id}
        roleName={selectedRole?.role_name}
        selectedRole={selectedRole as RoleInfo}
        refresh={() => baseListRef.current?.getData()}
      />
    </>
  );
};

export default TableList;
