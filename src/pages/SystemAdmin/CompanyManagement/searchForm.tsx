import { COMMON_STATUS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="company_name" label="公司名称">
        <Input placeholder="请输入公司名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="公司状态">
        <Select
          placeholder="请选择公司状态"
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
