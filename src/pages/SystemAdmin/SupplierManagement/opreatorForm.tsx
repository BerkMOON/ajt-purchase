import BrandSelect from '@/components/BusinessComponents/BrandSelect';
import { Form, Input } from 'antd';

export const createAndModifyForm = (props: { isModify: boolean }) => {
  return (
    <>
      {!props.isModify && (
        <Form.Item
          label="供应商编码"
          name="supplier_code"
          rules={[{ required: true, message: '请输入供应商编码' }]}
        >
          <Input placeholder="请输入供应商编码" />
        </Form.Item>
      )}
      <Form.Item
        label="供应商名称"
        name="supplier_name"
        rules={[{ required: true, message: '请输入供应商名称' }]}
      >
        <Input placeholder="请输入供应商名称" />
      </Form.Item>
      <Form.Item
        label="供应商所属品牌"
        name="brand_id_list"
        rules={[{ required: true, message: '请选择供应商所属品牌' }]}
      >
        <BrandSelect isPlatform={true} mode="multiple" />
      </Form.Item>
      <Form.Item label="联系人" name="contacts">
        <Input placeholder="请输入联系人" />
      </Form.Item>
      <Form.Item label="联系电话" name="phone">
        <Input placeholder="请输入联系电话" />
      </Form.Item>
      <Form.Item label="邮箱" name="email">
        <Input placeholder="请输入邮箱" type="email" />
      </Form.Item>
      <Form.Item label="所属公司" name="corporation">
        <Input placeholder="请输入所属公司" />
      </Form.Item>
      <Form.Item label="所在省份" name="province">
        <Input placeholder="请输入所在省份" />
      </Form.Item>
      <Form.Item label="所在城市" name="city">
        <Input placeholder="请输入所在城市" />
      </Form.Item>
      <Form.Item label="详细地址" name="address">
        <Input placeholder="请输入详细地址" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  );
};
