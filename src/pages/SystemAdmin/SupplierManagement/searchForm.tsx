import { COMMON_STATUS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="supplier_name" label="供应商名称">
        <Input placeholder="请输入供应商名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="supplier_code" label="供应商编码">
        <Input placeholder="请输入供应商编码" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="province" label="所在省份">
        <Input placeholder="请输入省份" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="city" label="所在城市">
        <Input placeholder="请输入城市" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="状态">
        <Select
          placeholder="请选择状态"
          allowClear
          style={{ width: 200 }}
          options={[
            { label: '生效', value: COMMON_STATUS.ACTIVE },
            { label: '停用', value: COMMON_STATUS.DELETED },
          ]}
        />
      </Form.Item>
    </Col>
  </>
);
