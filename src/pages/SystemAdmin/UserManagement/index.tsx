import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { COMMON_STATUS, COMMON_STATUS_CODE, Role } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import type { UserInfo } from '@/services/user/typings';
import { UserAPI } from '@/services/user/UserController';
import { Navigate, useAccess } from '@umijs/max';
import React, { useRef } from 'react';
import { getColumns } from './colums';
import ChangeUserBindingForm from './components/ChangeUserBindingForm';
import ChangeUserRoleForm from './components/ChangeUserRoleForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const DEFAULT_SEARCH_PARAMS = {
  status: COMMON_STATUS.ACTIVE,
  user_type: Role.Store,
};

const TableList: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const createOrModifyModal = useModalControl();
  const changeStatusModal = useModalControl();
  const resetPasswordModal = useModalControl();
  const changeRoleModal = useModalControl();
  const changeBindingModal = useModalControl();
  const [selectedUser, setSelectedUser] = React.useState<UserInfo | null>(null);

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    user?: UserInfo,
  ) => {
    if (user) {
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
    modalControl.open();
  };

  const columns = getColumns({
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
    resetPasswordModal,
    changeRoleModal,
    bindingModal: changeBindingModal,
  });

  const fetchUserData = async (params: any) => {
    const { data } = await UserAPI.queryUserList(params);
    return {
      list: data.users,
      total: data.count.total_count,
    };
  };

  const handleUserBindings = async ({
    userId,
    user_type,
    supplier_code,
    store_bindings,
  }: {
    userId: number;
    user_type?: Role;
    supplier_code?: string;
    store_bindings?: any[];
  }) => {
    try {
      if (user_type === Role.Supplier && supplier_code) {
        await UserAPI.bindSupplier({
          user_id: userId,
          supplier_code,
        });
      }
    } catch (error) {
      console.error('绑定供应商失败:', error);
    }

    try {
      if (
        user_type === Role.Store &&
        Array.isArray(store_bindings) &&
        store_bindings.length > 0
      ) {
        const storePairs = store_bindings
          .filter((item: any) => item?.company_id && item?.store_id)
          .map((item: any) => ({
            company_id: Number(item.company_id),
            store_id: Number(item.store_id),
          }));
        if (storePairs.length > 0) {
          await UserAPI.bindStore({
            user_id: userId,
            store_pairs: storePairs,
          });
        }
      }
    } catch (error) {
      console.error('绑定门店失败:', error);
    }
  };

  // 创建用户并绑定角色的包装函数
  const createUserWithRole = async (params: any) => {
    const { role_id, supplier_code, store_bindings, user_type, ...userParams } =
      params;
    // 先创建用户
    const createResponse = await UserAPI.createUser({
      ...userParams,
      user_type,
    });

    // 如果创建成功且有 role_id，则绑定角色
    if (createResponse.response_status.code === 200) {
      try {
        let userId: number | undefined;

        // 尝试从响应中获取用户ID
        if (
          createResponse.data &&
          typeof createResponse.data === 'object' &&
          'id' in createResponse.data
        ) {
          userId = (createResponse.data as any).id;
        } else {
          // 如果响应中没有用户ID，通过用户名查询获取
          const userListResponse = await UserAPI.queryUserList({
            username: userParams.username,
            page: 1,
            limit: 1,
          });
          if (
            userListResponse.data.users &&
            userListResponse.data.users.length > 0
          ) {
            userId = userListResponse.data.users[0].id;
          }
        }

        // 如果获取到用户ID，则绑定角色
        if (userId) {
          if (role_id) {
            await UserAPI.bindUserRole({
              user_id: userId,
              role_id: Number(role_id),
            });
          }

          await handleUserBindings({
            userId,
            user_type,
            supplier_code,
            store_bindings,
          });
        }
      } catch (error) {
        console.error('绑定角色失败:', error);
        // 即使绑定角色失败，也不影响用户创建成功
      }
    }

    return createResponse;
  };

  // 更新用户并绑定角色的包装函数
  const updateUserWithRole = async (params: any) => {
    const {
      role_id,
      user_id,
      supplier_code,
      store_bindings,
      user_type,
      ...userParams
    } = params;
    // 先更新用户信息
    const updateResponse = await UserAPI.modifyUserInfo({
      ...userParams,
      id: user_id,
      user_type,
    } as any);

    // 如果更新成功且有 role_id，则绑定角色
    if (updateResponse.response_status.code === 200 && user_id) {
      try {
        if (role_id) {
          await UserAPI.bindUserRole({
            user_id: Number(user_id),
            role_id: Number(role_id),
          });
        }

        await handleUserBindings({
          userId: Number(user_id),
          user_type,
          supplier_code,
          store_bindings,
        });
      } catch (error) {
        console.error('绑定角色失败:', error);
      }
    }

    return updateResponse;
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title="用户管理"
        columns={columns}
        searchFormItems={searchForm}
        defaultSearchParams={DEFAULT_SEARCH_PARAMS}
        fetchData={fetchUserData}
        createButton={{
          text: '新建用户',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={changeStatusModal.close}
        refresh={() => baseListRef.current?.getData()}
        params={{
          user_id: selectedUser?.id || '',
          status:
            selectedUser?.status.code === COMMON_STATUS_CODE.ACTIVE
              ? COMMON_STATUS.DELETED
              : COMMON_STATUS.ACTIVE,
        }}
        name="用户状态"
        api={UserAPI.updateUserStatus}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedUser(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '用户',
          successMsg: `${selectedUser ? '修改' : '创建'}用户成功`,
        }}
        api={selectedUser ? updateUserWithRole : createUserWithRole}
        record={selectedUser}
        idMapKey="user_id"
        idMapValue="id"
        operatorFields={(values: any) => {
          // 处理表单值，确保 user_id 正确传递
          if (selectedUser) {
            return {
              ...values,
              user_id: selectedUser.id,
              user_type: values.user_type || selectedUser.user_type,
            };
          }
          return values;
        }}
      >
        {createAndModifyForm(!!selectedUser)}
      </CreateOrModifyForm>
      <ResetPasswordForm
        modalVisible={resetPasswordModal.visible}
        onCancel={() => {
          resetPasswordModal.close();
          setSelectedUser(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        userId={selectedUser?.id}
        username={selectedUser?.username}
        api={UserAPI.resetUserPassword}
      />
      <ChangeUserRoleForm
        modalVisible={changeRoleModal.visible}
        onCancel={() => {
          changeRoleModal.close();
          setSelectedUser(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        userId={selectedUser?.id}
        username={selectedUser?.username}
        userType={selectedUser?.user_type}
      />
      <ChangeUserBindingForm
        modalVisible={changeBindingModal.visible}
        onCancel={() => {
          changeBindingModal.close();
          setSelectedUser(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        userId={selectedUser?.id}
        username={selectedUser?.username}
        userType={selectedUser?.user_type}
      />
    </>
  );
};

export default TableList;
