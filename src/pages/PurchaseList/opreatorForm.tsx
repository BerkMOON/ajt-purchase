import { StoreAPI } from '@/services/System/store/StoreController';
import type { StoreItem } from '@/services/System/store/typing';
import { UserInfo } from '@/services/System/user/typings';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Table,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;

interface CreateAndModifyFormProps {
  user: UserInfo & { isLogin: boolean };
  isStoreUser: boolean;
  userStoreIds: number[];
  isEdit: boolean;
}

export const CreateAndModifyForm: React.FC<CreateAndModifyFormProps> = ({
  user,
  isStoreUser,
  isEdit,
}) => {
  const [storeList, setStoreList] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const form = Form.useFormInstance();

  // 获取门店列表
  useEffect(() => {
    const fetchStores = async () => {
      if (isStoreUser) {
        // 门店用户：只显示自己的门店
        if (user.store_infos && user.store_infos.length > 0) {
          const stores = user.store_infos.map((store) => ({
            id: store.store_id,
            company_id: store.company_id,
            store_name: store.store_name,
            contacts: '',
            phone: '',
            email: '',
            address: '',
            remark: '',
            status: { code: 1, name: '生效' },
          }));
          setStoreList(stores);
          // 如果只有一个门店，自动选中
          if (stores.length === 1) {
            form.setFieldsValue({ store_id: stores[0].id });
          }
        }
      } else {
        // 平台用户：获取所有门店
        setLoading(true);
        try {
          const response = await StoreAPI.getAllStores({
            page: 1,
            limit: 100, // 获取前100个门店,
            company_id: '',
          });
          if (response.data?.stores) {
            setStoreList(response.data.stores);
          }
        } catch (error) {
          console.error('获取门店列表失败', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStores();
  }, [isStoreUser, user.store_infos, form]);

  return (
    <>
      <Form.Item
        name="store_id"
        label="采购门店"
        rules={[{ required: true, message: '请选择采购门店' }]}
      >
        <Select
          placeholder="请选择采购门店"
          allowClear={!isStoreUser && !isEdit}
          showSearch
          disabled={isEdit || (isStoreUser && storeList.length === 1)}
          loading={loading}
        >
          {storeList.map((store) => (
            <Option key={store.id} value={store.id}>
              {store.store_name}
            </Option>
          ))}
        </Select>
      </Form.Item>

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
                    title: '品牌',
                    dataIndex: 'brand',
                    width: 150,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, 'brand']}
                        rules={[{ required: true, message: '请输入品牌' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="品牌" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'SKU ID',
                    dataIndex: 'sku_id',
                    width: 180,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, 'sku_id']}
                        rules={[{ required: true, message: '请输入SKU ID' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="SKU ID" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: '配件名称',
                    dataIndex: 'product_name',
                    width: 200,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, 'product_name']}
                        rules={[{ required: true, message: '请输入配件名称' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="配件名称" />
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
                    title: '采购均价',
                    dataIndex: 'avg_price',
                    width: 120,
                    render: (_, field) => (
                      <Form.Item
                        {...field}
                        name={[field.name, 'avg_price']}
                        style={{ margin: 0 }}
                      >
                        <InputNumber
                          placeholder="均价"
                          min={0}
                          precision={2}
                          style={{ width: '100%' }}
                          disabled
                          addonAfter="元"
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
        提示：选择配件后，系统会自动从商品表中获取采购均价用于后续价格审批。
      </div>
    </>
  );
};
