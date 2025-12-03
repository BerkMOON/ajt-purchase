import type { Attr } from '@/services/system/attr/typings';
import { StatusInfo } from '@/types/common';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Space } from 'antd';
import React from 'react';

interface AttributeFormModalProps {
  visible: boolean;
  editingAttr: (Attr & { status?: StatusInfo }) | null;
  form: any;
  onSubmit: () => void;
  onCancel: () => void;
}

const AttributeFormModal: React.FC<AttributeFormModalProps> = ({
  visible,
  editingAttr,
  form,
  onSubmit,
  onCancel,
}) => {
  return (
    <Modal
      title={editingAttr ? '编辑属性' : '新增属性'}
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      width={800}
    >
      <Form form={form} layout="vertical">
        {!editingAttr && (
          <Form.Item
            name="attr_code"
            label="属性编码"
            rules={[{ required: true, message: '请输入属性编码' }]}
          >
            <Input placeholder="请输入属性编码" />
          </Form.Item>
        )}
        <Form.Item
          name="attr_name"
          label="属性名称"
          rules={[{ required: true, message: '请输入属性名称' }]}
        >
          <Input placeholder="请输入属性名称" />
        </Form.Item>
        <Form.Item name="sort" label="排序" initialValue={0}>
          <InputNumber
            placeholder="请输入排序值"
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        {!editingAttr && (
          <Form.Item label="属性值">
            <Form.List name="values">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space
                      key={field.key}
                      style={{ display: 'flex', marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, 'value_code']}
                        rules={[
                          { required: true, message: '请输入属性值编码' },
                        ]}
                      >
                        <Input
                          placeholder="属性值编码"
                          style={{ width: 150 }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value_name']}
                        rules={[
                          { required: true, message: '请输入属性值名称' },
                        ]}
                      >
                        <Input
                          placeholder="属性值名称"
                          style={{ width: 150 }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'sort']}
                        initialValue={0}
                      >
                        <InputNumber
                          placeholder="排序"
                          min={0}
                          style={{ width: 100 }}
                        />
                      </Form.Item>
                      <Button
                        type="link"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        删除
                      </Button>
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加属性值
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default AttributeFormModal;
