import { Form, Input } from 'antd';

export const createAndModifyForm = (
  <>
    <Form.Item
      name="company_name"
      label="公司名称"
      rules={[{ required: true, message: '请输入公司名称' }]}
    >
      <Input placeholder="请输入公司名称" allowClear />
    </Form.Item>
    <Form.Item name="remark" label="描述">
      <Input placeholder="请输入描述" allowClear />
    </Form.Item>
  </>
);
