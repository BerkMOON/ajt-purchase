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
import { formatPriceToFen, formatPriceToYuanNumber } from '@/utils/prince';
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
  const [batchDeliveryDate, setBatchDeliveryDate] = useState<any>(null);
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
          formData[`quote_price_${fieldKey}`] = formatPriceToYuanNumber(
            item.quote_price,
          );
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

      // 构建所有 SKU 数据，筛选出「报价单价 + 单项交货时间」都填写的项（至少一个配件两项都填即可）
      const allItems = inquiry.items.map((item, index) => {
        const fieldKey = getItemFieldKey(item, index);
        const deliveryDateValue = values[`item_delivery_${fieldKey}`];
        return {
          sku_id: item.sku_id,
          quote_price: values[`quote_price_${fieldKey}`],
          expected_delivery_date: formatDate(deliveryDateValue, true),
          remark: values[`item_remark_${fieldKey}`] || '',
          alreadyQuoted: !!item.quote_price, // 该配件是否已有报价，决定用提交还是更新接口
        };
      });

      const itemsToSubmit = allItems.filter(
        (item) =>
          item.quote_price !== undefined &&
          item.quote_price !== null &&
          item.quote_price !== '' &&
          Number(item.quote_price) > 0 &&
          item.expected_delivery_date !== undefined &&
          item.expected_delivery_date !== '' &&
          item.expected_delivery_date !== '0001-01-01',
      );

      if (itemsToSubmit.length === 0) {
        message.error('请至少填写一个配件的报价单价和单项交货时间');
        setSaving(false);
        return;
      }

      const errors: string[] = [];
      for (const item of itemsToSubmit) {
        const apiMethod = item.alreadyQuoted
          ? QuoteAPI.updateSupplierQuote
          : QuoteAPI.submitSupplierQuote;
        try {
          await apiMethod({
            inquiry_no: inquiry.inquiry_no,
            order_no: inquiry.order_no,
            sku_id: item.sku_id,
            quote_price: formatPriceToFen(item.quote_price) || 0,
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
        message.success('报价保存成功！');
      } else if (errors.length === itemsToSubmit.length) {
        message.error('报价提交失败，请稍后重试');
      } else {
        message.warning(`部分报价提交成功，${errors.length} 个失败`);
      }
    } catch (error: any) {
      message.error(error?.message || '报价提交失败');
      console.error(error);
    } finally {
      fetchData();
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
                <Descriptions.Item label="采购门店">
                  {inquiry.store_name}
                </Descriptions.Item>
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
              {canSubmit && (
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <DatePicker
                      placeholder="批量选择交货日期"
                      value={batchDeliveryDate}
                      onChange={(val) => setBatchDeliveryDate(val)}
                      format="YYYY-MM-DD"
                    />
                    <Button
                      onClick={() => {
                        if (!batchDeliveryDate) {
                          message.warning('请先选择要批量填写的交货日期');
                          return;
                        }

                        const fields: Record<string, any> = {};
                        inquiry.items.forEach((item, index) => {
                          const fieldKey = getItemFieldKey(item, index);
                          fields[`item_delivery_${fieldKey}`] =
                            batchDeliveryDate;
                        });
                        form.setFieldsValue(fields);
                        message.success('已批量填充单项交货时间');
                      }}
                    >
                      批量填充单项交货时间
                    </Button>
                  </Space>
                </div>
              )}
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Table
                  columns={[
                    {
                      title: '第三方编码',
                      dataIndex: 'third_code',
                      key: 'third_code',
                      width: 220,
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
                      title: '采购类型',
                      dataIndex: 'purchase_type',
                      key: 'purchase_type',
                      width: 120,
                    },
                    {
                      title: (
                        <span>
                          报价单价 <span style={{ color: 'red' }}>*</span>
                        </span>
                      ),
                      key: 'quote_price',
                      width: 200,
                      render: (_, record, index) => {
                        const fieldKey = getItemFieldKey(record, index);
                        return (
                          <Form.Item
                            name={`quote_price_${fieldKey}`}
                            rules={
                              canSubmit
                                ? [
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
                      title: (
                        <span>
                          单项交货时间 <span style={{ color: 'red' }}>*</span>
                        </span>
                      ),
                      key: 'item_delivery',
                      width: 220,
                      render: (_, record, index) => {
                        const fieldKey = getItemFieldKey(record, index);
                        return (
                          <Form.Item
                            name={`item_delivery_${fieldKey}`}
                            rules={
                              canSubmit
                                ? [
                                    {
                                      validator: async (_, value) => {
                                        const priceValue = form.getFieldValue(
                                          `quote_price_${fieldKey}`,
                                        );
                                        // 未填写价格时，不做校验
                                        if (
                                          priceValue === undefined ||
                                          priceValue === null ||
                                          priceValue === '' ||
                                          Number(priceValue) <= 0
                                        ) {
                                          return Promise.resolve();
                                        }
                                        // 填了价格但没选日期，提示错误
                                        if (!value) {
                                          // eslint-disable-next-line prefer-promise-reject-errors
                                          return Promise.reject(
                                            '请选择单项交货时间',
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]
                                : []
                            }
                            style={{ margin: 0 }}
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
