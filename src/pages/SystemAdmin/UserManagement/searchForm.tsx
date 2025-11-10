import { COMMON_STATUS, USER_TYPE_OPTIONS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="name" label="用户姓名">
        <Input placeholder="请输入用户姓名" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="phone" label="手机号">
        <Input placeholder="请输入手机号" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="email" label="邮箱">
        <Input placeholder="请输入邮箱" allowClear />
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
    <Col>
      <Form.Item name="user_type" label="用户类型">
        <Select
          style={{ width: 200 }}
          options={USER_TYPE_OPTIONS}
          placeholder="请选择用户类型"
        />
      </Form.Item>
    </Col>
  </>
);
