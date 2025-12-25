import { COMMON_STATUS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="brand_name" label="品牌名称">
        <Input placeholder="请输入品牌名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="品牌状态">
        <Select
          placeholder="请选择品牌状态"
          allowClear
          style={{ width: 200 }}
          options={[
            { label: '生效', value: COMMON_STATUS.ACTIVE },
            { label: '已停用', value: COMMON_STATUS.DELETED },
          ]}
        />
      </Form.Item>
    </Col>
  </>
);
