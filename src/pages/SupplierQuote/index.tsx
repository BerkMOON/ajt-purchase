import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { PurchaseItem } from '@/services/purchase/typings';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Navigate, useAccess, useParams, useSearchParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Result,
  Row,
  Space,
  Table,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

// 模拟供应商数据
const mockSuppliers = [
  { id: '1', name: '北京汽配供应商', contact: '张经理', phone: '138****1234' },
  { id: '2', name: '上海零部件公司', contact: '李经理', phone: '139****5678' },
  { id: '3', name: '广州配件批发商', contact: '王经理', phone: '137****9012' },
];

const SupplierQuote: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get('supplier') || '1';
  const [purchase, setPurchase] = useState<PurchaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const currentSupplier = mockSuppliers.find((s) => s.id === supplierId);

  // 获取采购单详情和现有报价
  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [purchaseResponse, quotesResponse] = await Promise.all([
        PurchaseAPI.getPurchaseDetail(id),
        PurchaseAPI.getPurchaseQuotes(id),
      ]);

      setPurchase(purchaseResponse.data);

      // 查找当前供应商的报价数据
      const myQuote = quotesResponse.data.find(
        (q: any) => q.supplier_id === supplierId,
      );
      if (myQuote) {
        const formData: any = {};
        myQuote.part_quotes?.forEach((pq: any) => {
          formData[`unit_price_${pq.part_id}`] = pq.unit_price;
          formData[`delivery_date_${pq.part_id}`] = pq.delivery_date
            ? dayjs(pq.delivery_date)
            : null;
          formData[`remark_${pq.part_id}`] = pq.remark;
        });
        form.setFieldsValue(formData);
      }
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, supplierId]);

  // 提交报价
  const handleSubmit = async (values: any) => {
    if (!purchase || !currentSupplier) return;

    try {
      setSaving(true);

      const partQuotes = purchase.purchase_details.map((detail) => {
        const unitPrice = values[`unit_price_${detail.id}`] || 0;
        const quantity = detail.quantity;
        return {
          part_id: detail.id,
          unit_price: unitPrice,
          total_price: unitPrice * quantity,
          delivery_date:
            values[`delivery_date_${detail.id}`]?.format('YYYY-MM-DD') || '',
          remark: values[`remark_${detail.id}`] || '',
        };
      });

      const totalAmount = partQuotes.reduce(
        (sum, pq) => sum + pq.total_price,
        0,
      );

      const quoteData = {
        supplier_name: currentSupplier.name,
        part_quotes: partQuotes,
        total_amount: totalAmount,
      };

      await PurchaseAPI.submitQuote(purchase.id, supplierId, quoteData);
      message.success('报价提交成功');
    } catch (error) {
      message.error('报价提交失败');
    } finally {
      setSaving(false);
    }
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>加载中...</div>
    );
  }

  if (!purchase || !currentSupplier) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="采购单不存在或无权限访问"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        {/* 头部信息 */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.history.back()}
                >
                  返回
                </Button>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                  供应商报价 - {purchase.purchase_no}
                </span>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => form.submit()}
              >
                保存报价
              </Button>
            </Col>
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          {/* 供应商信息 */}
          <Col span={24}>
            <Card title="供应商信息" size="small">
              <Descriptions column={3} bordered>
                <Descriptions.Item label="供应商名称">
                  {currentSupplier.name}
                </Descriptions.Item>
                <Descriptions.Item label="联系人">
                  {currentSupplier.contact}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {currentSupplier.phone}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* 采购单信息 */}
          <Col span={24}>
            <Card title="采购单信息" size="small">
              <Descriptions column={4} bordered>
                <Descriptions.Item label="采购单号">
                  {purchase.purchase_no}
                </Descriptions.Item>
                <Descriptions.Item label="采购门店">
                  {purchase.store_name}
                </Descriptions.Item>
                <Descriptions.Item label="采购人">
                  {purchase.creator_name}
                </Descriptions.Item>
                <Descriptions.Item label="期望到货日期">
                  {purchase.expected_delivery_date}
                </Descriptions.Item>
                {purchase.remark && (
                  <Descriptions.Item label="备注" span={4}>
                    {purchase.remark}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* 报价表单 */}
          <Col span={24}>
            <Card title="配件报价" size="small">
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Table
                  columns={[
                    {
                      title: '配件编码',
                      dataIndex: 'part_code',
                      key: 'part_code',
                      width: 120,
                    },
                    {
                      title: '配件名称',
                      dataIndex: 'part_name',
                      key: 'part_name',
                      width: 150,
                    },
                    {
                      title: '规格型号',
                      dataIndex: 'specification',
                      key: 'specification',
                      width: 120,
                    },
                    {
                      title: '采购数量',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 80,
                      align: 'center',
                    },
                    {
                      title: '单位',
                      dataIndex: 'unit',
                      key: 'unit',
                      width: 60,
                      align: 'center',
                    },
                    {
                      title: '历史均价',
                      dataIndex: 'historical_avg_price',
                      key: 'historical_avg_price',
                      width: 100,
                      align: 'right',
                      render: (price: number) =>
                        price ? `¥${price.toFixed(2)}` : '-',
                    },
                    {
                      title: '报价单价 *',
                      key: 'unit_price',
                      width: 120,
                      render: (_, record) => (
                        <Form.Item
                          name={`unit_price_${record.id}`}
                          rules={[
                            { required: true, message: '请输入报价' },
                            {
                              type: 'number',
                              min: 0,
                              message: '价格不能为负数',
                            },
                          ]}
                          style={{ margin: 0 }}
                        >
                          <InputNumber
                            min={0}
                            precision={2}
                            placeholder="单价"
                            style={{ width: '100%' }}
                            addonBefore="¥"
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '预计交货期',
                      key: 'delivery_date',
                      width: 140,
                      render: (_, record) => (
                        <Form.Item
                          name={`delivery_date_${record.id}`}
                          style={{ margin: 0 }}
                        >
                          <DatePicker
                            placeholder="交货日期"
                            style={{ width: '100%' }}
                            disabledDate={(current) =>
                              current && current < dayjs().endOf('day')
                            }
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '备注',
                      key: 'remark',
                      render: (_, record) => (
                        <Form.Item
                          name={`remark_${record.id}`}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="备注信息" />
                        </Form.Item>
                      ),
                    },
                  ]}
                  dataSource={purchase.purchase_details}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 1000 }}
                />

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Space>
                    <Button onClick={() => window.history.back()}>取消</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      icon={<SaveOutlined />}
                    >
                      提交报价
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SupplierQuote;
