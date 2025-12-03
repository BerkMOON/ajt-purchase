import PurchaseStoreSelect from '@/components/BusinessComponents/PurchaseStoreSelect';
import SkuSelect from '@/components/BusinessComponents/SkuSelect';
import { UserInfo } from '@/services/system/user/typings';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Table,
} from 'antd';
import React from 'react';

const { TextArea } = Input;

interface CreateAndModifyFormProps {
  user: UserInfo & { isLogin: boolean };
  isStoreUser: boolean;
  userStoreIds: number[];
  isEdit: boolean;
}

export const CreateAndModifyForm: React.FC<CreateAndModifyFormProps> = ({
  isStoreUser,
  isEdit,
}) => {
  const form = Form.useFormInstance();

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="store_id"
            label="采购门店"
            rules={[{ required: true, message: '请选择采购门店' }]}
          >
            <PurchaseStoreSelect
              form={form}
              disabled={isEdit}
              allowClear={!isStoreUser && !isEdit}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="expected_delivery_date"
            label="期望到货日期"
            rules={[{ required: true, message: '请选择期望到货日期' }]}
          >
            <DatePicker
              placeholder="请选择期望到货日期"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="inquiry_deadline"
            label="询价截止时间"
            rules={[{ required: true, message: '请选择询价截止时间' }]}
          >
            <DatePicker
              showTime
              placeholder="请选择询价截止时间"
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="remark" label="备注">
        <TextArea rows={3} placeholder="请输入备注信息" maxLength={500} />
      </Form.Item>

      <Form.Item label="配件清单" required>
        <Form.List
          name="items"
          rules={[
            {
              validator: async (_, items) => {
                if (!items || items.length < 1) {
                  return Promise.reject(new Error('至少添加一个配件'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              <Table
                dataSource={fields}
                pagination={false}
                size="small"
                rowKey="key"
                scroll={{ x: 800 }}
                columns={[
                  {
                    title: 'SKU',
                    dataIndex: 'sku_id',
                    width: 300,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, 'sku_id']}
                        rules={[{ required: true, message: '请选择SKU' }]}
                        style={{ margin: 0 }}
                      >
                        <SkuSelect placeholder="请选择SKU" />
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
                          precision={0}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: '操作',
                    width: 80,
                    fixed: 'right',
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
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>

      <div style={{ color: '#999', fontSize: 12, marginTop: -16 }}>
        提示：选择SKU后，系统会自动填充配件名称和采购均价，用于后续价格审批。
      </div>
    </>
  );
};
