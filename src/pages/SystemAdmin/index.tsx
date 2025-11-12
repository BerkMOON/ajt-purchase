import {
  ApartmentOutlined,
  AppstoreOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Card, Col, Result, Row, Tabs } from 'antd';
import React, { useState } from 'react';
import AccessApiManagement from './AccessApiManagement';
import CategoryManagement from './CategoryManagement';
import CompanyManagement from './CompanyManagement';
import ProductManagement from './ProductManagement';
import RoleManagement from './RoleManagement';
import SKUManagement from './SKUManagement';
import StoreManagement from './StoreManagement';
import SupplierManagement from './SupplierManagement';
import UserManagement from './UserManagement';

const { TabPane } = Tabs;

const SystemAdmin: React.FC = () => {
  const { isLogin, systemAdmin } = useAccess();
  const [activeTab, setActiveTab] = useState('overview');

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
      tab: 'category',
    },
    {
      title: '产品管理',
      description: '管理产品信息和销售属性配置',
      icon: <AppstoreOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      tab: 'product',
    },
    {
      title: 'SKU资源管理',
      description: '管理具体的商品资源（SKU）',
      icon: <PictureOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      tab: 'sku',
    },
    {
      title: '公司管理',
      description: '管理公司信息',
      icon: <TeamOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      tab: 'company',
    },
    {
      title: '门店管理',
      description: '管理集团门店信息',
      icon: <ShopOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      tab: 'store',
    },
    {
      title: '供应商管理',
      description: '管理供应商信息和资质',
      icon: <TeamOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      tab: 'supplier',
    },
    {
      title: '接口管理',
      description: '管理系统接口权限与分级',
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#873bf4' }} />
      ),
      tab: 'accessApi',
    },
    {
      title: '用户管理',
      description: '管理系统用户',
      icon: <UserOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      tab: 'user',
    },
    {
      title: '角色管理',
      description: '管理系统用户角色权限分配',
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#873bf4' }} />
      ),
      tab: 'role',
    },
  ];

  const handleCardClick = (func: any) => {
    if (func.tab) {
      setActiveTab(func.tab);
    } else if (func.onClick) {
      func.onClick();
    }
  };

  // 概览页面
  const OverviewPage = () => (
    <div>
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

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
      >
        <TabPane tab="管理概览" key="overview">
          <OverviewPage />
        </TabPane>
        <TabPane tab="品类树管理" key="category">
          <CategoryManagement />
        </TabPane>
        <TabPane tab="产品管理" key="product">
          <ProductManagement />
        </TabPane>
        <TabPane tab="SKU资源管理" key="sku">
          <SKUManagement />
        </TabPane>
        <TabPane tab="公司管理" key="company">
          <CompanyManagement />
        </TabPane>
        <TabPane tab="门店管理" key="store">
          <StoreManagement />
        </TabPane>
        <TabPane tab="用户管理" key="user">
          <UserManagement />
        </TabPane>
        <TabPane tab="角色管理" key="role">
          <RoleManagement />
        </TabPane>
        <TabPane tab="供应商管理" key="supplier">
          <SupplierManagement />
        </TabPane>
        <TabPane tab="接口管理" key="accessApi">
          <AccessApiManagement />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemAdmin;
