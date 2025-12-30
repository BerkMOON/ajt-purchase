import { CartAPI } from '@/services/cart/CartController';
import type { CartItem } from '@/services/cart/typings';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Table,
  message,
} from 'antd';
import { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

interface CreatePurchaseModalProps {
  visible: boolean;
  loading: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
  visible,
  loading,
  form,
  onCancel,
  onSubmit,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // 获取购物车数据
  useEffect(() => {
    if (visible) {
      const fetchCartList = async () => {
        setLoadingCart(true);
        try {
          const response = await CartAPI.getCartList();
          if (response.response_status.code === 200 && response.data) {
            const items = response.data.sku_list || [];
            setCartItems(items);

            // 初始化数量表单值，使用购物车中的数量
            const initialQuantities: Record<string | number, number> = {};
            const initialReturnPurchase: Record<string | number, boolean> = {};
            items.forEach((item) => {
              if (item.sku_id !== undefined && item.sku_id !== null) {
                // 使用字符串作为 key，因为表单的 name 路径会转换为字符串
                const skuIdKey = String(item.sku_id);
                initialQuantities[skuIdKey] = item.quantity || 1;
                initialReturnPurchase[skuIdKey] = false; // 默认为非回采商品
              }
            });
            form.setFieldsValue({
              quantities: initialQuantities,
              return_purchase: initialReturnPurchase,
              expected_delivery_date: dayjs().add(7, 'days'),
              inquiry_deadline: dayjs().add(30, 'minutes'),
              remark: '',
            });
          }
        } catch (error) {
          console.error('获取购物车数据失败:', error);
          message.error('获取购物车数据失败');
        } finally {
          setLoadingCart(false);
        }
      };

      fetchCartList();
    } else {
      // 关闭弹窗时重置表单
      form.resetFields();
      setCartItems([]);
    }
  }, [visible, form]);

  const columns = [
    {
      title: '产品编码',
      dataIndex: 'third_code',
      key: 'third_code',
      width: 200,
    },
    {
      title: 'SKU ID',
      dataIndex: 'sku_id',
      key: 'sku_id',
      width: 100,
    },
    {
      title: 'SKU 名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '数量',
      key: 'quantity',
      width: 150,
      render: (_: any, record: CartItem) => {
        // 确保 sku_id 存在
        if (record.sku_id === undefined || record.sku_id === null) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Form.Item
            name={['quantities', String(record.sku_id)]}
            style={{ margin: 0 }}
            rules={[
              { required: true, message: '请输入数量' },
              { type: 'number', min: 1, message: '数量不能小于1' },
            ]}
          >
            <InputNumber
              min={1}
              max={999}
              size="small"
              style={{ width: 100 }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '是否回采',
      key: 'return_purchase',
      width: 100,
      render: (_: any, record: CartItem) => {
        // 确保 sku_id 存在
        if (record.sku_id === undefined || record.sku_id === null) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Form.Item
            name={['return_purchase', String(record.sku_id)]}
            style={{ margin: 0 }}
            valuePropName="checked"
            getValueFromEvent={(e) => e.target.checked}
            initialValue={false}
          >
            <Checkbox />
          </Form.Item>
        );
      },
    },
  ];

  return (
    <Modal
      title="创建采购单"
      open={visible}
      onCancel={onCancel}
      width={1000}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          创建采购单
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="期望到货日期"
              name="expected_delivery_date"
              rules={[{ required: true, message: '请选择期望到货日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={3} placeholder="请输入备注信息（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <h4>SKU清单</h4>
          <Table
            dataSource={cartItems}
            rowKey="sku_id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
            columns={columns}
            loading={loadingCart}
            locale={{
              emptyText: '购物车是空的',
            }}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseModal;
