import {
  InquiryAPI,
  InquiryDetailResponse,
  InquiryItemResponse,
  InquiryItemStatus,
  InquiryQuoteItemResponse,
} from '@/services/inquiry';
import { QuoteAPI } from '@/services/quote';
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
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const { TextArea } = Input;

const getItemFieldKey = (item: InquiryItemResponse, index: number): string => {
  if (item.id) {
    return `item_${item.id}`;
  }
  if (item.sku_id) {
    return `sku_${item.sku_id}`;
  }
  return `idx_${index}`;
};

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

  const [inquiry, setInquiry] = useState<InquiryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const statusInfo = inquiry?.status || { code: -1, name: '' };
  const statusName = statusInfo.name || '';
  const isPending = statusName === '待报价';
  const isQuotedStatus = statusName === '已报价';
  const isDeadlinePassed = inquiry
    ? dayjs().isAfter(dayjs(inquiry.deadline))
    : false;

  const fetchData = useCallback(async () => {
    if (!inquiryNo) return;
    try {
      setLoading(true);
      const inquiryResponse = await InquiryAPI.getSupplierInquiryDetail({
        inquiry_no: inquiryNo,
      });
      setInquiry(inquiryResponse.data);
      form.resetFields();
      const formData: Record<string, any> = {};
      const quoteMap = new Map<string, InquiryQuoteItemResponse>();
      inquiryResponse.data.quotes?.forEach((quoteItem) => {
        quoteMap.set(String(quoteItem.sku_id), quoteItem);
      });

      inquiryResponse.data.items.forEach((item, index) => {
        const fieldKey = getItemFieldKey(item, index);
        const matchedQuote = quoteMap.get(String(item.sku_id));
        if (matchedQuote) {
          formData[`quote_price_${fieldKey}`] = matchedQuote.quote_price;
          formData[`item_delivery_${fieldKey}`] =
            matchedQuote.expected_delivery_date
              ? dayjs(matchedQuote.expected_delivery_date)
              : null;
          formData[`item_remark_${fieldKey}`] = matchedQuote.remark;
        }
      });

      form.setFieldsValue(formData);
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

  const statusTagColor = useMemo(() => {
    switch (statusName) {
      case '待报价':
        return 'warning';
      case '已报价':
        return 'success';
      case '已选中':
        return 'purple';
      case '未报价':
        return 'red';
      case '未选中':
        return 'default';
      default:
        return 'default';
    }
  }, [statusName]);

  const getInquiryItemStatusColor = (status: InquiryItemStatus) => {
    switch (status) {
      case InquiryItemStatus.PENDING:
        return 'default';
      case InquiryItemStatus.QUOTED:
        return 'success';
      case InquiryItemStatus.CANCELLED:
        return 'red';
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    if (!inquiry) return;
    try {
      setSaving(true);
      const items = inquiry.items.map((item, index) => {
        const fieldKey = getItemFieldKey(item, index);
        const deliveryDateValue = values[`item_delivery_${fieldKey}`];
        return {
          sku_id: item.sku_id,
          quantity: item.quantity,
          quote_price: values[`quote_price_${fieldKey}`],
          expected_delivery_date: deliveryDateValue
            ? dayjs(deliveryDateValue).format('YYYY-MM-DD')
            : '',
          remark: values[`item_remark_${fieldKey}`] || '',
        };
      });

      await QuoteAPI.submitSupplierQuote({
        inquiry_no: inquiry.inquiry_no,
        order_no: inquiry.order_no,
        items,
      });
      message.success('报价提交成功！');
      fetchData();
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

  const canSubmit =
    !isViewMode && !isDeadlinePassed && (isPending || isQuotedStatus);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => history.back()}
                >
                  返回
                </Button>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {isViewMode ? '查看报价' : '供应商报价'} -{' '}
                  {inquiry.inquiry_no}
                </span>
                {isViewMode && <Tag color="blue">只读模式</Tag>}
                {isDeadlinePassed && <Tag color="red">询价已过期</Tag>}
                {statusName && <Tag color={statusTagColor}>{statusName}</Tag>}
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
                  {isQuotedStatus ? '更新报价' : '提交报价'}
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {isDeadlinePassed && !isViewMode && (
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
                  <span style={{ color: isDeadlinePassed ? 'red' : 'inherit' }}>
                    {dayjs(inquiry.deadline).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="采购单号">
                  {inquiry.order_no}
                </Descriptions.Item>
                <Descriptions.Item label="询价状态">
                  <Tag color={statusTagColor}>{statusName || '未知状态'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(inquiry.ctime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {dayjs(inquiry.mtime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="配件报价" size="small">
              <Form form={form} onFinish={handleSubmit} layout="vertical">
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
                      dataIndex: 'sku_name',
                      key: 'sku_name',
                      width: 200,
                    },
                    {
                      title: '数量',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 90,
                      align: 'center',
                    },
                    {
                      title: canSubmit ? '报价单价 *' : '报价单价',
                      key: 'quote_price',
                      width: 150,
                      render: (_, record, index) => {
                        const fieldKey = getItemFieldKey(record, index);
                        return (
                          <Form.Item
                            name={`quote_price_${fieldKey}`}
                            rules={
                              canSubmit
                                ? [
                                    {
                                      required: true,
                                      message: '请输入报价单价',
                                    },
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
                        );
                      },
                    },
                    {
                      title: '单项交货时间',
                      key: 'item_delivery',
                      width: 180,
                      render: (_, record, index) => {
                        const fieldKey = getItemFieldKey(record, index);
                        return (
                          <Form.Item
                            name={`item_delivery_${fieldKey}`}
                            style={{ margin: 0 }}
                            rules={
                              canSubmit
                                ? [
                                    {
                                      required: true,
                                      message: '请选择交货日期',
                                    },
                                  ]
                                : []
                            }
                          >
                            <DatePicker
                              placeholder="选择日期"
                              style={{ width: '100%' }}
                              format="YYYY-MM-DD"
                              disabled={!canSubmit}
                            />
                          </Form.Item>
                        );
                      },
                    },
                    {
                      title: '状态',
                      key: 'status',
                      width: 180,
                      render: (record: InquiryQuoteItemResponse) => {
                        return (
                          <Tag
                            color={getInquiryItemStatusColor(
                              record.status?.code ?? InquiryItemStatus.PENDING,
                            )}
                          >
                            {record.status?.name ?? '待报价'}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: '备注',
                      key: 'item_remark',
                      width: 200,
                      render: (_, record, index) => {
                        const fieldKey = getItemFieldKey(record, index);
                        return (
                          <Form.Item
                            name={`item_remark_${fieldKey}`}
                            style={{ margin: 0 }}
                          >
                            <TextArea
                              rows={1}
                              placeholder="备注（选填）"
                              disabled={!canSubmit}
                            />
                          </Form.Item>
                        );
                      },
                    },
                  ]}
                  dataSource={inquiry.items.map((item) => ({
                    ...item,
                    status: inquiry.quotes.find(
                      (quote) => quote.sku_id === item.sku_id,
                    )?.status,
                  }))}
                  rowKey={(record, index) =>
                    record.id ?? record.sku_id ?? `row_${index}`
                  }
                  pagination={false}
                  size="small"
                  scroll={{ x: 1000 }}
                />

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  {canSubmit ? (
                    <Space size="large">
                      <Button size="large" onClick={() => history.back()}>
                        取消
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={saving}
                        icon={<SaveOutlined />}
                      >
                        {isQuotedStatus ? '更新报价' : '提交报价'}
                      </Button>
                    </Space>
                  ) : (
                    <Button size="large" onClick={() => history.back()}>
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
