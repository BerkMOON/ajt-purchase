import { Role } from '@/constants';
import { UserInfo } from '@/services/System/user/typings';
import { useModel } from '@umijs/max';
import { Col, DatePicker, Form, Input, Select } from 'antd';
import React from 'react';
import { PurchaseStatusMap } from '../PurchaseDetail/constants';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 门店筛选列组件（根据用户类型显示/隐藏）
const StoreFilterCol: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const user = (initialState || {}) as UserInfo & { isLogin: boolean };
  const isStoreUser = user.user_type === Role.Store;

  // 门店用户不显示门店筛选（因为只能看自己的门店，已自动过滤）
  if (isStoreUser) {
    return null;
  }

  return (
    <Col span={12}>
      <Form.Item name="store_id" label="采购门店">
        <Select
          placeholder="请选择采购门店"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {/* TODO: 从API获取门店列表数据 */}
          <Option value="1">门店A</Option>
          <Option value="2">门店B</Option>
          <Option value="3">门店C</Option>
        </Select>
      </Form.Item>
    </Col>
  );
};

export const searchForm = (
  <>
    <Col>
      <Form.Item name="order_no" label="采购单号">
        <Input placeholder="请输入采购单号（支持模糊搜索）" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="date_range" label="创建日期">
        <RangePicker placeholder={['开始日期', '结束日期']} />
      </Form.Item>
    </Col>
    <StoreFilterCol />
    <Col>
      <Form.Item name="status" label="采购单状态">
        <Select
          style={{ width: '200px' }}
          placeholder="请选择采购单状态"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {Object.values(PurchaseStatusMap)
            .filter((status) => status.code !== 0) // 过滤掉草稿状态
            .map((status) => (
              <Option key={status.code} value={status.code}>
                {status.name}
              </Option>
            ))}
        </Select>
      </Form.Item>
    </Col>
  </>
);
