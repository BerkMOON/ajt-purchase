import {
  InquiryAPI,
  InquiryDetailResponse,
  InquiryItemResponse,
} from '@/services/inquiry';
import {
  InquiryStatus,
  InquiryStatusTagColor,
} from '@/services/inquiry/constant';
import { QuoteAPI } from '@/services/quote';
import { QuoteStatusTagColor } from '@/services/quote/constant';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Navigate, useAccess, useParams, useSearchParams } from '@umijs/max';
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
import React, { useCallback, useEffect, useState } from 'react';
import { formatDate } from '../PurchaseDetail/utils';

const { TextArea } = Input;

const getItemFieldKey = (item: InquiryItemResponse, index: number): string => {
  if (item.sku_id) {
    return `sku_${item.sku_id}`;
  }
  return `idx_${index}`;
};

const SupplierQuote: React.FC = () => {
  const { isLogin } = useAccess();
  const { id: inquiryNo } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'edit';
  const isViewMode = mode === 'view';

  const [inquiry, setInquiry] = useState<InquiryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const statusInfo = inquiry?.status || { code: -1, name: '' };
  const statusName = statusInfo.name;
  const isQuoting = statusInfo.code === InquiryStatus.Quoting;
  const isDeadlinePassed = dayjs().isAfter(dayjs(inquiry?.deadline));
  const isQuoted = inquiry?.items.some((item) => item.quote_price);

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

      // InquiryItemResponse 现在直接包含报价信息
      inquiryResponse.data.items.forEach((item, index) => {
        const fieldKey = getItemFieldKey(item, index);
        // 如果已有报价信息，回填到表单
        if (item.quote_price) {
          formData[`quote_price_${fieldKey}`] = item.quote_price;
        }
        if (
          item.expected_delivery_date &&
          item.expected_delivery_date !== '0001-01-01'
        ) {
          formData[`item_delivery_${fieldKey}`] = dayjs(
            item.expected_delivery_date,
          );
        }
        if (item.remark) {
          formData[`item_remark_${fieldKey}`] = item.remark;
        }
      });

      form.setFieldsValue(formData);
    } catch (error) {
      message.error('获取询价单详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [form, inquiryNo]);

  useEffect(() => {
    if (inquiryNo) {
      fetchData();
    }
  }, [fetchData, inquiryNo]);

  const handleSubmit = async (values: Record<string, any>) => {
    if (!inquiry) return;
    try {
      setSaving(true);

      // 构建所有需要提交的 SKU 数据
      const itemsToSubmit = inquiry.items.map((item, index) => {
        const fieldKey = getItemFieldKey(item, index);
        const deliveryDateValue = values[`item_delivery_${fieldKey}`];
        return {
          sku_id: item.sku_id,
          quote_price: values[`quote_price_${fieldKey}`],
          expected_delivery_date: formatDate(deliveryDateValue, true),
          remark: values[`item_remark_${fieldKey}`] || '',
        };
      });

      // 逐个提交每个 SKU 的报价
      const errors: string[] = [];
      for (const item of itemsToSubmit) {
        try {
          await QuoteAPI.submitSupplierQuote({
            inquiry_no: inquiry.inquiry_no,
            order_no: inquiry.order_no,
            sku_id: item.sku_id,
            quote_price: item.quote_price,
            expected_delivery_date: item.expected_delivery_date,
            remark: item.remark,
          });
        } catch (error: any) {
          const errorMsg = error?.message || `SKU ${item.sku_id} 提交失败`;
          errors.push(errorMsg);
          console.error(`提交 SKU ${item.sku_id} 失败:`, error);
        }
      }

      // 处理提交结果
      if (errors.length === 0) {
        message.success('所有报价提交成功！');
        fetchData();
      } else if (errors.length === itemsToSubmit.length) {
        // 全部失败
        message.error('报价提交失败，请稍后重试');
      } else {
        // 部分成功
        message.warning(`部分报价提交成功，${errors.length} 个失败`);
        fetchData(); // 即使部分失败，也刷新数据以显示成功的部分
      }
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

  const canSubmit = !isViewMode && isQuoting;

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
                <Tag
                  color={
                    InquiryStatusTagColor[
                      statusInfo.code as keyof typeof InquiryStatusTagColor
                    ]
                  }
                >
                  {statusName}
                </Tag>
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
                  {isQuoted ? '更新报价' : '提交报价'}
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {!isQuoting && !isViewMode && (
          <Alert
            message="询价已结束"
            description="此询价单已结束，无法提交报价。"
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
                <Descriptions.Item label="期望到货时间">
                  {inquiry.expected_delivery_date}
                </Descriptions.Item>
                <Descriptions.Item label="截止时间">
                  <span style={{ color: isDeadlinePassed ? 'red' : 'inherit' }}>
                    {formatDate(inquiry.deadline)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="采购单号">
                  {inquiry.order_no}
                </Descriptions.Item>
                <Descriptions.Item label="询价状态">
                  <Tag
                    color={
                      InquiryStatusTagColor[
                        statusInfo.code as keyof typeof InquiryStatusTagColor
                      ] || 'default'
                    }
                  >
                    {statusName || '未知状态'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDate(inquiry.ctime)}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {formatDate(inquiry.mtime)}
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
                      render: (_: any, record: InquiryItemResponse) => {
                        return (
                          <Tag
                            color={
                              QuoteStatusTagColor[record.status?.code] ||
                              'default'
                            }
                          >
                            {record.status?.name}
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
                  dataSource={inquiry.items}
                  rowKey={(record: InquiryItemResponse, index) =>
                    record.sku_id ? `sku_${record.sku_id}` : `row_${index}`
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
                        {isQuoted ? '更新报价' : '提交报价'}
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
