import { Role, ROLES_INFO } from '@/constants';
import { UserInfo } from '@/services/system/user/typings';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import { Navigate, useAccess, useModel } from '@umijs/max';
import { Avatar, Card, Descriptions, Space, Tag } from 'antd';
import React from 'react';

const UserInfoPage: React.FC = () => {
  const { isLogin } = useAccess();
  const { initialState } = useModel('@@initialState');

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  const user = (initialState || {}) as UserInfo & { isLogin: boolean };
  const statusValue = resolveCommonStatus(user.status);
  const statusMeta = getStatusMeta(statusValue);

  const roleLabel =
    ROLES_INFO[user.user_type as keyof typeof ROLES_INFO] || user.user_type;

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
          <Descriptions.Item label="最近登录时间">
            {user.login_date || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="最近登录IP">
            {user.login_ip || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="密码更新时间">
            {user.pwd_update_date || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {user.remark || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {user.create_time || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {user.modify_time || '-'}
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
    </div>
  );
};

export default UserInfoPage;
