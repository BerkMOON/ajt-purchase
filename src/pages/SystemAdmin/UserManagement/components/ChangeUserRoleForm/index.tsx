import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { COMMON_STATUS, Role } from '@/constants';
import { useRequest } from '@/hooks/useRequest';
import { RoleAPI } from '@/services/System/role/RoleController';
import { RoleInfo } from '@/services/System/role/typings';
import { UserAPI } from '@/services/System/user/UserController';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';

export interface ChangeUserRoleFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  refresh: () => void;
  userId?: number;
  username?: string;
  userType?: string;
}

const ChangeUserRoleForm: React.FC<ChangeUserRoleFormProps> = ({
  modalVisible,
  onCancel,
  refresh,
  userId,
  username,
  userType,
}) => {
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState<number | undefined>(
    undefined,
  );
  const [form] = Form.useForm();

  // 获取用户当前角色
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId || !modalVisible) return;

      try {
        const roleResponse = await UserAPI.getUserRole({ user_id: userId });
        if (roleResponse.response_status.code === 200 && roleResponse.data) {
          setCurrentRoleId(roleResponse.data.role_ids[0]);
          form.setFieldsValue({ role_id: roleResponse.data.role_ids[0] });
        }
      } catch (error) {
        console.error('获取用户角色失败:', error);
      }
    };

    fetchUserRole();
  }, [userId, modalVisible, form]);

  // 根据 user_type 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      if (!userType || !modalVisible) {
        setRoleOptions([]);
        return;
      }

      setLoadingRoles(true);
      try {
        const response = await RoleAPI.getRoleList({
          role_type: userType as Role,
          status: COMMON_STATUS.ACTIVE,
          page: 1,
          limit: 100, // 获取所有角色
        });
        const roles = response.data.roles || [];
        setRoleOptions(
          roles.map((role: RoleInfo) => ({
            label: role.role_name,
            value: role.id,
          })),
        );
      } catch (error) {
        console.error('获取角色列表失败:', error);
        setRoleOptions([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [userType, modalVisible]);

  const { loading, run } = useRequest<any, null>(UserAPI.bindUserRole, {
    successMsg: `修改${username || '用户'}角色成功`,
    onSuccess: refresh,
  });

  const handleSubmit = async (values: { role_id: number }) => {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    return await run({
      user_id: userId,
      role_id: Number(values.role_id),
    });
  };

  return (
    <BaseModalForm
      title={`修改${username || '用户'}角色`}
      visible={modalVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
      initialValues={{ role_id: currentRoleId }}
      ownForm={form}
    >
      <Form.Item
        label="用户角色"
        name="role_id"
        rules={[{ required: true, message: '请选择用户角色' }]}
      >
        <Select
          options={roleOptions}
          placeholder="请选择用户角色"
          loading={loadingRoles}
          disabled={!userType || loadingRoles}
          notFoundContent={
            !userType
              ? '用户类型不能为空'
              : loadingRoles
              ? '加载中...'
              : '暂无角色'
          }
        />
      </Form.Item>
    </BaseModalForm>
  );
};

export default ChangeUserRoleForm;
