import CategoryCascader from '@/components/BasicComponents/CategoryCascader';
import RichTextEditor from '@/components/BasicComponents/RichTextEditor';
import { Col, Form, Input } from 'antd';
import React from 'react';

const ProductFormFields: React.FC = () => {
  return (
    <>
      <Col>
        <Form.Item
          label="产品名称"
          name="name"
          rules={[{ required: true, message: '请输入产品名称' }]}
        >
          <Input placeholder="请输入产品名称" />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item
          label="所属品类"
          name="category_id"
          rules={[{ required: true, message: '请选择所属品类' }]}
        >
          <CategoryCascader />
        </Form.Item>
      </Col>

      <Form.Item
        label="规格"
        name="specification"
        getValueFromEvent={(value) => value}
      >
        <RichTextEditor placeholder="请输入规格说明..." height={400} />
      </Form.Item>

      <Col>
        <Form.Item label="备注" name="remark">
          <Input placeholder="请输入备注" />
        </Form.Item>
      </Col>

      {/* <Form.Item label="产品图片" name="photos">
        <Upload listType="picture-card" maxCount={5} beforeUpload={() => false}>
          + 上传
        </Upload>
      </Form.Item> */}
    </>
  );
};

export default ProductFormFields;
