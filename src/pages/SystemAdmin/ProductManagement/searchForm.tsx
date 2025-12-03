import CategoryCascader from '@/components/BasicComponents/CategoryCascader';
import { COMMON_CATEGORY_STATUS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

const { Option } = Select;

export const searchForm = () => (
  <>
    <Col>
      <Form.Item name="name" label="产品名称">
        <Input placeholder="请输入产品名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="product_id" label="产品ID">
        <Input placeholder="请输入产品ID" allowClear type="number" />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="category_id" label="所属品类">
        <CategoryCascader style={{ width: 200 }} />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="状态">
        <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
          <Option value={COMMON_CATEGORY_STATUS.ACTIVE}>启用</Option>
          <Option value={COMMON_CATEGORY_STATUS.DISABLED}>停用</Option>
        </Select>
      </Form.Item>
    </Col>
  </>
);
