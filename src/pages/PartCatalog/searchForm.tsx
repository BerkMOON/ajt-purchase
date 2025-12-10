import CategoryCascader from '@/components/BasicComponents/CategoryCascader';
import { Col, Form, Input } from 'antd';

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
        <CategoryCascader isPurchase={true} style={{ width: 200 }} />
      </Form.Item>
    </Col>
  </>
);
