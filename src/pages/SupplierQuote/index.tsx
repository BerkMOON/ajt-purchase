import { InquiryAPI, SupplierInquiryDetail } from '@/services/inquiry';
import { QuoteAPI, SupplierQuoteDetail } from '@/services/quote';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Navigate,
  useAccess,
  useModel,
  useParams,
  useSearchParams,
} from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Result,
  Row,
  Space,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const { TextArea } = Input;

const SupplierQuote: React.FC = () => {
  const { isLogin } = useAccess();
  const { initialState } = useModel('@@initialState');
  const { id: inquiryNo } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'edit';
  const isViewMode = mode === 'view';

  const rawSupplierInfos =
    (initialState as any)?.supplier_infos ??
    (initialState as any)?.currentUser?.supplier_infos ??
    [];
  const supplierInfos = (rawSupplierInfos || []).map((info: any) => ({
    supplier_code: info?.supplier_code ?? info?.code ?? '',
    supplier_name: info?.supplier_name ?? info?.name ?? '',
  }));
  const supplierCodeFromQuery = searchParams.get('supplier_code');
  const currentSupplier = useMemo(() => {
    if (!supplierInfos || supplierInfos.length === 0) {
      return null;
    }
    if (supplierCodeFromQuery) {
      return (
        supplierInfos.find(
          (item: any) => item.supplier_code === supplierCodeFromQuery,
        ) || null
      );
    }
    return supplierInfos[0];
  }, [supplierInfos, supplierCodeFromQuery]);

  const [inquiry, setInquiry] = useState<SupplierInquiryDetail | null>(null);
  const [existingQuote, setExistingQuote] =
    useState<SupplierQuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    if (!inquiryNo) return;
    const supplierCode =
      currentSupplier?.supplier_code || supplierCodeFromQuery || undefined;
    try {
      setLoading(true);
      const inquiryResponse = await InquiryAPI.getSupplierInquiryDetail({
        inquiry_no: inquiryNo,
        supplier_code: supplierCode,
      });
      setInquiry(inquiryResponse.data);
      if (inquiryResponse.data.quote) {
        setExistingQuote(inquiryResponse.data.quote);
        const formData: Record<string, any> = {
          expected_delivery_days:
            inquiryResponse.data.quote.expected_delivery_days,
          remark: inquiryResponse.data.quote.remark,
        };
        inquiryResponse.data.quote.items?.forEach((item) => {
          formData[`quote_price_${item.inquiry_item_id}`] = item.quote_price;
          formData[`item_delivery_${item.inquiry_item_id}`] =
            item.expected_delivery_days;
          formData[`item_remark_${item.inquiry_item_id}`] = item.remark;
        });
        form.setFieldsValue(formData);
      } else {
        form.resetFields();
      }
    } catch (error) {
      message.error('获取询价单详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [form, inquiryNo, currentSupplier?.supplier_code, supplierCodeFromQuery]);

  useEffect(() => {
    if (inquiryNo) {
      fetchData();
    }
  }, [fetchData, inquiryNo]);

  const handleSubmit = async (values: Record<string, any>) => {
    if (!inquiry) return;
    try {
      setSaving(true);
      const items = inquiry.items.map((item) => ({
        inquiry_item_id: item.inquiry_item_id,
        quote_price: values[`quote_price_${item.inquiry_item_id}`],
        expected_delivery_days: values[`item_delivery_${item.inquiry_item_id}`],
        remark: values[`item_remark_${item.inquiry_item_id}`] || '',
      }));

      await QuoteAPI.submitSupplierQuote({
        inquiry_no: inquiry.inquiry_no,
        expected_delivery_days: values.expected_delivery_days || 7,
        remark: values.remark || '',
        items,
      });
      message.success('报价提交成功！');
      setTimeout(() => window.close(), 1500);
    } catch (error: any) {
      message.error(error?.message || '报价提交失败');
      console.error(error);
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

  if (!inquiry) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="询价单不存在或无权限访问"
        extra={
          <Button type="primary" onClick={() => window.close()}>
            关闭
          </Button>
        }
      />
    );
  }

  const isExpired = new Date(inquiry.deadline) < new Date();
  const canSubmit = !isViewMode && !isExpired;

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.close()}
                >
                  返回
                </Button>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {isViewMode ? '查看报价' : '供应商报价'} -{' '}
                  {inquiry.inquiry_no}
                </span>
                {isViewMode && <Tag color="blue">只读模式</Tag>}
                {isExpired && !isViewMode && <Tag color="red">询价已过期</Tag>}
                {existingQuote && <Tag color="success">已报价</Tag>}
                {currentSupplier && (
                  <Tag color="default">
                    当前供应商：{currentSupplier.supplier_name}
                  </Tag>
                )}
              </Space>
            </Col>
            {canSubmit && (
              <Col>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={() => form.submit()}
                >
                  {existingQuote ? '更新报价' : '提交报价'}
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {isExpired && !isViewMode && (
          <Alert
            message="询价已过期"
            description="此询价单已超过截止时间，无法提交报价。"
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="询价信息" size="small">
              <Descriptions column={3} bordered>
                <Descriptions.Item label="供应商名称">
                  {inquiry.supplier_name}
                </Descriptions.Item>
                <Descriptions.Item label="询价单号">
                  {inquiry.inquiry_no}
                </Descriptions.Item>
                <Descriptions.Item label="截止时间">
                  <span style={{ color: isExpired ? 'red' : 'inherit' }}>
                    {dayjs(inquiry.deadline).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="采购单号">
                  {inquiry.order_no}
                </Descriptions.Item>
                <Descriptions.Item label="询价状态">
                  <Tag
                    color={
                      inquiry.status.code === 0
                        ? 'warning'
                        : inquiry.status.code === 1
                        ? 'success'
                        : 'default'
                    }
                  >
                    {inquiry.status.name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(inquiry.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="配件报价" size="small">
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                initialValues={{ expected_delivery_days: 7 }}
              >
                <Table
                  columns={[
                    {
                      title: 'SKU ID',
                      dataIndex: 'sku_id',
                      key: 'sku_id',
                      width: 120,
                    },
                    {
                      title: '商品名称',
                      dataIndex: 'product_name',
                      key: 'product_name',
                      width: 200,
                    },
                    {
                      title: '品牌',
                      dataIndex: 'brand',
                      key: 'brand',
                      width: 120,
                    },
                    {
                      title: '数量',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 90,
                      align: 'center',
                    },
                    {
                      title: '历史均价',
                      dataIndex: 'avg_price',
                      key: 'avg_price',
                      width: 120,
                      align: 'right',
                      render: (price?: number) =>
                        price ? `¥${price.toFixed(2)}` : '-',
                    },
                    {
                      title: canSubmit ? '报价单价 *' : '报价单价',
                      key: 'quote_price',
                      width: 150,
                      render: (_, record) => (
                        <Form.Item
                          name={`quote_price_${record.inquiry_item_id}`}
                          rules={
                            canSubmit
                              ? [
                                  { required: true, message: '请输入报价单价' },
                                  {
                                    type: 'number',
                                    min: 0.01,
                                    message: '价格必须大于0',
                                  },
                                ]
                              : []
                          }
                          style={{ margin: 0 }}
                        >
                          <InputNumber
                            min={0}
                            precision={2}
                            placeholder="单价"
                            addonBefore="¥"
                            style={{ width: '100%' }}
                            disabled={!canSubmit}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '单项交货天数',
                      key: 'item_delivery',
                      width: 150,
                      render: (_, record) => (
                        <Form.Item
                          name={`item_delivery_${record.inquiry_item_id}`}
                          style={{ margin: 0 }}
                        >
                          <InputNumber
                            min={0}
                            precision={0}
                            placeholder="天数"
                            style={{ width: '100%' }}
                            disabled={!canSubmit}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: '备注',
                      key: 'item_remark',
                      width: 200,
                      render: (_, record) => (
                        <Form.Item
                          name={`item_remark_${record.inquiry_item_id}`}
                          style={{ margin: 0 }}
                        >
                          <TextArea
                            rows={1}
                            placeholder="备注（选填）"
                            disabled={!canSubmit}
                          />
                        </Form.Item>
                      ),
                    },
                  ]}
                  dataSource={inquiry.items}
                  rowKey="inquiry_item_id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 1000 }}
                />

                <Row gutter={24} style={{ marginTop: 24 }}>
                  <Col span={8}>
                    <Form.Item
                      label="预计整体交货天数"
                      name="expected_delivery_days"
                      rules={
                        canSubmit
                          ? [
                              { required: true, message: '请输入交货天数' },
                              { type: 'number', min: 1, message: '至少1天' },
                            ]
                          : []
                      }
                    >
                      <InputNumber
                        min={1}
                        precision={0}
                        placeholder="天数"
                        style={{ width: '100%' }}
                        disabled={!canSubmit}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item label="整体备注" name="remark">
                      <TextArea
                        rows={3}
                        placeholder="请输入整体备注（选填）"
                        disabled={!canSubmit}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  {canSubmit ? (
                    <Space size="large">
                      <Button size="large" onClick={() => window.close()}>
                        取消
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={saving}
                        icon={<SaveOutlined />}
                      >
                        {existingQuote ? '更新报价' : '提交报价'}
                      </Button>
                    </Space>
                  ) : (
                    <Button size="large" onClick={() => window.close()}>
                      关闭
                    </Button>
                  )}
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
