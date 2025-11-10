import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { useRequest } from '@/hooks/useRequest';
import { ResponseInfoType } from '@/types/common';
import { Form, Input } from 'antd';

export interface ResetPasswordFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  refresh: () => void;
  userId?: number;
  username?: string;
  api: (params?: any) => Promise<ResponseInfoType<null>>;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  modalVisible,
  onCancel,
  refresh,
  userId,
  username,
  api,
}) => {
  const { loading, run } = useRequest<any, null>(api, {
    successMsg: `重置${username || '用户'}密码成功`,
    onSuccess: refresh,
  });

  const handleSubmit = async (values: { password: string }) => {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    return await run({
      user_id: userId,
      password: values.password,
    });
  };

  return (
    <BaseModalForm
      title={`重置${username || '用户'}密码`}
      visible={modalVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <Form.Item
        label="新密码"
        name="password"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码长度至少6位' },
        ]}
      >
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>
      <Form.Item
        label="确认密码"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="请再次输入新密码" />
      </Form.Item>
    </BaseModalForm>
  );
};

export default ResetPasswordForm;
