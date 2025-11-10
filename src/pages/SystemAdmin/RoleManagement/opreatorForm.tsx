import { USER_TYPE_OPTIONS } from '@/constants';
import { Form, Input, Select } from 'antd';

export const createAndModifyForm = () => (
  <>
    <Form.Item label="角色名称" name="role_name">
      <Input placeholder="请输入角色名称" />
    </Form.Item>
    <Form.Item label="角色key" name="role_key">
      <Input placeholder="请输入角色key" />
    </Form.Item>
    <Form.Item label="角色类型" name="role_type">
      <Select options={USER_TYPE_OPTIONS} placeholder="请选择角色类型" />
    </Form.Item>
    <Form.Item label="备注" name="remark">
      <Input.TextArea placeholder="请输入备注" />
    </Form.Item>
  </>
);
