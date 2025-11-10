import { COMMON_STATUS, USER_TYPE_OPTIONS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="role_name" label="角色名称">
        <Input placeholder="请输入角色名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="role_key" label="角色key">
        <Input placeholder="请输入角色key" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="role_type" label="角色类型">
        <Select
          style={{ width: 200 }}
          options={USER_TYPE_OPTIONS}
          placeholder="请选择角色类型"
        />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="用户状态">
        <Select
          placeholder="请选择用户状态"
          allowClear
          style={{ width: 200 }}
          options={[
            { label: '生效', value: COMMON_STATUS.ACTIVE },
            { label: '已失效', value: COMMON_STATUS.DELETED },
          ]}
        />
      </Form.Item>
    </Col>
  </>
);
