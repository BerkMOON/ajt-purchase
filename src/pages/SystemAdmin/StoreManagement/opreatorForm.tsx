import CompanySelect from '@/components/BusinessComponents/CompanySelect';
import { Form, Input } from 'antd';

export const createAndModifyForm = (props: { isModify: boolean }) => {
  return (
    <>
      {!props.isModify && (
        <Form.Item
          label="公司"
          name="company_id"
          rules={[{ required: true, message: '请选择公司' }]}
        >
          <CompanySelect />
        </Form.Item>
      )}
      <Form.Item
        label="门店名称"
        name="store_name"
        rules={[{ required: true, message: '请输入门店名称' }]}
      >
        <Input placeholder="请输入门店名称" />
      </Form.Item>
      <Form.Item label="联系人" name="contacts">
        <Input placeholder="请输入联系人" />
      </Form.Item>
      <Form.Item label="手机号" name="phone">
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item label="邮箱" name="email">
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item label="地址" name="address">
        <Input placeholder="请输入地址" />
      </Form.Item>
      <Form.Item label="描述" name="remark">
        <Input.TextArea placeholder="请输入描述" />
      </Form.Item>
    </>
  );
};
