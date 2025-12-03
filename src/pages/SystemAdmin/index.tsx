import {
  ApartmentOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, Navigate, useAccess } from '@umijs/max';
import { Card, Col, Result, Row } from 'antd';
import React from 'react';

const SystemAdmin: React.FC = () => {
  const { isLogin, systemAdmin } = useAccess();

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!systemAdmin) {
    return (
      <Result status="403" title="403" subTitle="无权限访问系统管理功能" />
    );
  }

  // 功能卡片配置
  const adminFunctions = [
    {
      title: '品类树管理',
      description: '管理商品分类层级结构（2-3级）',
      icon: <ApartmentOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      path: '/admin/category',
    },
    {
      title: '产品管理',
      description: '管理产品信息和销售属性配置',
      icon: <AppstoreOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      path: '/admin/product',
    },
    {
      title: '公司管理',
      description: '管理公司信息',
      icon: <TeamOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      path: '/admin/company',
    },
    {
      title: '门店管理',
      description: '管理集团门店信息',
      icon: <ShopOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      path: '/admin/store',
    },
    {
      title: '供应商管理',
      description: '管理供应商信息和资质',
      icon: <TeamOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      path: '/admin/supplier',
    },
    {
      title: '接口管理',
      description: '管理系统接口权限与分级',
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#873bf4' }} />
      ),
      path: '/admin/access-api',
    },
    {
      title: '用户管理',
      description: '管理系统用户',
      icon: <UserOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      path: '/admin/user',
    },
    {
      title: '角色管理',
      description: '管理系统用户角色权限分配',
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#873bf4' }} />
      ),
      path: '/admin/role',
    },
  ];

  const handleCardClick = (func: any) => {
    if (func.path) {
      history.push(func.path);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {adminFunctions.map((func, index) => (
          <Col span={8} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: 200 }}
              bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
              }}
              onClick={() => handleCardClick(func)}
            >
              <div style={{ marginBottom: 16 }}>{func.icon}</div>
              <h3 style={{ marginBottom: 8 }}>{func.title}</h3>
              <p style={{ color: '#666', margin: 0 }}>{func.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SystemAdmin;
