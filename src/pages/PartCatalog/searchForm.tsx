import BrandSelect from '@/components/BusinessComponents/BrandSelect';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="sku_id" label="SKU ID">
        <Input placeholder="请输入SKU ID" allowClear type="number" />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="sku_name" label="SKU 名称">
        <Input placeholder="请输入SKU 名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="third_code" label="产品编码">
        <Input placeholder="请输入产品编码" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="brand_id" label="品牌">
        <BrandSelect placeholder="请选择品牌" style={{ width: 200 }} />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="product_id" label="产品ID">
        <Input placeholder="请输入产品ID" allowClear type="number" />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="product_type" label="产品类型">
        <Select placeholder="请选择产品类型" allowClear style={{ width: 150 }}>
          <Select.Option value="parts">备件</Select.Option>
          <Select.Option value="boutique">精品</Select.Option>
        </Select>
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="状态">
        <Select placeholder="请选择状态" allowClear style={{ width: 150 }}>
          <Select.Option value="active">启用</Select.Option>
        </Select>
      </Form.Item>
    </Col>
  </>
);
