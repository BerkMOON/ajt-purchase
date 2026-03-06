import { Role, ROLES_INFO } from '@/constants';
import { UserAPI } from '@/services/system/user/UserController';
import { UserInfo } from '@/services/system/user/typings';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import { Navigate, useAccess, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Space,
  Tag,
} from 'antd';
import React, { useState } from 'react';

const UserInfoPage: React.FC = () => {
  const { isLogin } = useAccess();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  const user = (initialState || {}) as UserInfo & { isLogin: boolean };
  const statusValue = resolveCommonStatus(user.status);
  const statusMeta = getStatusMeta(statusValue);

  const roleLabel =
    ROLES_INFO[user.user_type as keyof typeof ROLES_INFO] || user.user_type;

  const handleChangePassword = async (values: {
    old_password: string;
    new_password: string;
  }) => {
    try {
      setPasswordLoading(true);
      await UserAPI.resetSelfPassword({
        old: values.old_password,
        new: values.new_password,
      });
      message.success('密码修改成功');
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || '修改密码失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Space align="start">
          <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
            {user.nickname?.[0] || user.username?.[0] || 'U'}
          </Avatar>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {user.nickname || user.username}
            </div>
            <div style={{ color: '#999', marginTop: 4 }}>{user.username}</div>
            <div style={{ marginTop: 8 }}>
              <Tag color={statusMeta.color}>{statusMeta.text}</Tag>
              <Tag>{roleLabel}</Tag>
            </div>
          </div>
        </Space>
      </Card>

      <Card title="基本信息" style={{ marginTop: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="账号">
            {user.username || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="姓名">
            {user.nickname || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">
            {user.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {user.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="用户类型">
            {roleLabel || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {user.remark || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {user.user_type === Role.Store && (
        <Card title="所属门店" style={{ marginTop: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="公司">
              {user.store_infos?.map((store) => (
                <div key={store.store_id}>{store.company_name}</div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="门店">
              {user.store_infos?.map((store) => (
                <div key={store.store_id}>{store.store_name}</div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      {user.user_type === Role.Supplier && (
        <Card title="所属供应商" style={{ marginTop: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="供应商名称">
              {user.supplier_infos?.map((supplier) => (
                <div key={supplier.supplier_code}>{supplier.supplier_name}</div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      <Card title="修改密码" style={{ marginTop: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            label="当前密码"
            name="old_password"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              placeholder="请输入当前密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="new_password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
          >
            <Input.Password
              placeholder="请输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirm_password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserInfoPage;
