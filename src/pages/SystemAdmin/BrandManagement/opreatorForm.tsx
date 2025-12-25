import { Form, Input } from 'antd';

export const createAndModifyForm = () => {
  return (
    <>
      <Form.Item
        label="品牌名称"
        name="brand_name"
        rules={[{ required: true, message: '请输入品牌名称' }]}
      >
        <Input placeholder="请输入品牌名称" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea
          placeholder="请输入备注"
          rows={4}
          maxLength={500}
          showCount
        />
      </Form.Item>
    </>
  );
};
