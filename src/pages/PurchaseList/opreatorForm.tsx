import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
} from 'antd';

const { TextArea } = Input;

export const createAndModifyForm = (
  <>
    <Form.Item
      name="expected_delivery_date"
      label="期望到货日期"
      rules={[{ required: true, message: '请选择期望到货日期' }]}
    >
      <DatePicker placeholder="请选择期望到货日期" style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item name="remark" label="备注">
      <TextArea rows={3} placeholder="请输入备注信息" />
    </Form.Item>

    <Form.Item label="配件清单" required>
      <Form.List name="purchase_details">
        {(fields, { add, remove }) => (
          <>
            <Table
              dataSource={fields}
              pagination={false}
              size="small"
              rowKey="key"
              columns={[
                {
                  title: '配件编码',
                  dataIndex: 'part_code',
                  width: 150,
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'part_code']}
                      rules={[{ required: true, message: '请输入配件编码' }]}
                      style={{ margin: 0 }}
                    >
                      <Input placeholder="配件编码" />
                    </Form.Item>
                  ),
                },
                {
                  title: '配件名称',
                  dataIndex: 'part_name',
                  width: 200,
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'part_name']}
                      rules={[{ required: true, message: '请输入配件名称' }]}
                      style={{ margin: 0 }}
                    >
                      <Input placeholder="配件名称" />
                    </Form.Item>
                  ),
                },
                {
                  title: '规格型号',
                  dataIndex: 'specification',
                  width: 180,
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'specification']}
                      rules={[{ required: true, message: '请输入规格型号' }]}
                      style={{ margin: 0 }}
                    >
                      <Input placeholder="规格型号" />
                    </Form.Item>
                  ),
                },
                {
                  title: '采购数量',
                  dataIndex: 'quantity',
                  width: 120,
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'quantity']}
                      rules={[
                        { required: true, message: '请输入采购数量' },
                        { type: 'number', min: 1, message: '数量必须大于0' },
                      ]}
                      style={{ margin: 0 }}
                    >
                      <InputNumber
                        placeholder="数量"
                        min={1}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  ),
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  width: 100,
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'unit']}
                      rules={[{ required: true, message: '请输入单位' }]}
                      style={{ margin: 0 }}
                    >
                      <Input placeholder="单位" />
                    </Form.Item>
                  ),
                },
                {
                  title: '操作',
                  width: 80,
                  render: (_, field) => (
                    <Popconfirm
                      title="确定删除这个配件吗？"
                      onConfirm={() => remove(field.name)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="link"
                        icon={<MinusCircleOutlined />}
                        danger
                        size="small"
                      />
                    </Popconfirm>
                  ),
                },
              ]}
            />

            <Form.Item style={{ marginTop: 16 }}>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加配件
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form.Item>
  </>
);
