import { Form, Input, InputNumber, Modal } from 'antd';
import React from 'react';

interface AttributeValueFormModalProps {
  visible: boolean;
  isEdit: boolean;
  form: any;
  onSubmit: () => void;
  onCancel: () => void;
}

const AttributeValueFormModal: React.FC<AttributeValueFormModalProps> = ({
  visible,
  isEdit,
  form,
  onSubmit,
  onCancel,
}) => {
  return (
    <Modal
      title={isEdit ? '编辑属性值' : '新增属性值'}
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="value_code"
          label="属性值编码"
          rules={[{ required: true, message: '请输入属性值编码' }]}
        >
          <Input placeholder="请输入属性值编码" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="value_name"
          label="属性值名称"
          rules={[{ required: true, message: '请输入属性值名称' }]}
        >
          <Input placeholder="请输入属性值名称" />
        </Form.Item>
        <Form.Item name="sort" label="排序" initialValue={0}>
          <InputNumber
            placeholder="请输入排序值"
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AttributeValueFormModal;
