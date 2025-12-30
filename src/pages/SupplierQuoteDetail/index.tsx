import { QuoteAPI } from '@/services/quote';
import { QuoteStatusTagColor } from '@/services/quote/constant';
import type { SupplierQuoteResponse } from '@/services/quote/typings.d';
import { formatPriceToYuan } from '@/utils/prince';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Result,
  Row,
  Space,
  Spin,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../PurchaseDetail/utils';

const SupplierQuoteDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { quoteNo } = useParams<{ quoteNo: string }>();
  const [quote, setQuote] = useState<SupplierQuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteDetail = async () => {
      if (!quoteNo) return;

      try {
        setLoading(true);
        const response = await QuoteAPI.getSupplierQuoteDetail(quoteNo);
        setQuote(response.data);
      } catch (error) {
        message.error('获取报价详情失败');
        console.error('获取报价详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetail();
  }, [quoteNo]);

  const goBack = () => {
    history.push('/supplier-quotes');
  };

  if (!isLogin) {
    return <Result status="403" title="403" subTitle="请先登录" />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quote) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="报价单不存在"
        extra={
          <Button type="primary" onClick={goBack}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
              返回
            </Button>
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>
              报价单详情 - {quote.quote_no}
            </span>
            <Tag color={QuoteStatusTagColor[quote.status?.code]}>
              {quote.status.name}
            </Tag>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="基本信息" size="small">
              <Descriptions column={3} bordered>
                <Descriptions.Item label="报价单号">
                  {quote.quote_no}
                </Descriptions.Item>
                <Descriptions.Item label="询价单号">
                  {quote.inquiry_no}
                </Descriptions.Item>
                <Descriptions.Item label="采购单号">
                  <a
                    onClick={() => {
                      history.push(`/purchase/${quote.order_no}`);
                    }}
                  >
                    {quote.order_no}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="商品ID">
                  {quote.sku_id}
                </Descriptions.Item>
                <Descriptions.Item label="商品名称">
                  {quote.sku_name}
                </Descriptions.Item>
                <Descriptions.Item label="数量">
                  {quote.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="报价单价">
                  {formatPriceToYuan(quote.quote_price)}
                </Descriptions.Item>
                <Descriptions.Item label="报价总价">
                  {formatPriceToYuan(quote.total_price)}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={QuoteStatusTagColor[quote.status?.code]}>
                    {quote.status.name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="预计交货日期">
                  {formatDate(quote.expected_delivery_date, true)}
                </Descriptions.Item>
                <Descriptions.Item label="提交时间">
                  {formatDate(quote.submit_time)}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDate(quote.ctime)}
                </Descriptions.Item>
                <Descriptions.Item label="备注" span={3}>
                  {quote.remark || '-'}
                </Descriptions.Item>
                {quote.tracking_info && (
                  <Descriptions.Item label="物流信息" span={3}>
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="物流单号">
                        {quote.tracking_info.tracking_no_list.join(',')}
                      </Descriptions.Item>
                      <Descriptions.Item label="备注">
                        {quote.tracking_info.remark || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SupplierQuoteDetail;
