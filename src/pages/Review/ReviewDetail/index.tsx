import { REVIEW_RESULT } from '@/services/system/review/constants';
import { ReviewAPI } from '@/services/system/review/ReviewController';
import type { PendingApprovalQuotesInfo } from '@/services/system/review/typings';
import { formatPriceToYuan } from '@/utils/prince';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Result,
  Row,
  Space,
  Spin,
  Tag,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { formatDate } from '../../PurchaseDetail/utils';

const ReviewDetail: React.FC = () => {
  const { isLogin, reviewList } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] =
    useState<PendingApprovalQuotesInfo | null>(null);

  // 获取审批详情数据
  const fetchReviewDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // 这里需要调用获取单个审批详情的接口
      const response = await ReviewAPI.getPendingApprovalQuotes({
        page: 1,
        limit: 1000, // 获取足够多的数据以便查找
        quote_no: Number(id),
      });

      const quote = response.data?.quotes[0];

      if (quote) {
        setReviewData(quote);
      } else {
        message.error('未找到审批记录');
        history.push('/review/list');
      }
    } catch (error) {
      message.error('获取审批详情失败');
      console.error('获取审批详情失败:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReviewDetail();
  }, [fetchReviewDetail]);

  // 审批通过
  const handleApprove = () => {
    if (!reviewData) return;

    Modal.confirm({
      title: '确认审批',
      content: `确定要通过报价单 ${reviewData.quote_no} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await ReviewAPI.approveQuote({
            order_no: reviewData.order_no,
            quote_no: reviewData.quote_no,
            result: REVIEW_RESULT.APPROVE,
          });
          message.success('审批通过成功');
          history.push('/review/list');
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.message || error?.message || '审批失败';
          message.error(errorMsg);
          console.error('审批失败:', error);
        }
      },
    });
  };

  // 审批驳回
  const handleReject = () => {
    if (!reviewData) return;

    Modal.confirm({
      title: '确认驳回',
      content: `确定要驳回报价单 ${reviewData.quote_no} 吗？`,
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await ReviewAPI.approveQuote({
            order_no: reviewData.order_no,
            quote_no: reviewData.quote_no,
            result: REVIEW_RESULT.REJECT,
          });
          message.success('已驳回');
          history.push('/review/list');
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.message || error?.message || '驳回失败';
          message.error(errorMsg);
          console.error('驳回失败:', error);
        }
      },
    });
  };

  // 返回列表
  const goBack = () => {
    history.push('/review/list');
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!reviewList) {
    return <Result status="403" title="403" subTitle="无权限访问审批详情" />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!reviewData) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="未找到审批记录"
        extra={
          <Button type="primary" onClick={goBack}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            返回
          </Button>
        </Space>

        <Card title="审批详情" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="报价单号">
              {reviewData.quote_no}
            </Descriptions.Item>
            <Descriptions.Item label="采购单号">
              {reviewData.order_no}
            </Descriptions.Item>
            <Descriptions.Item label="询价单号">
              {reviewData.inquiry_no}
            </Descriptions.Item>
            <Descriptions.Item label="SKU ID">
              {reviewData.sku_id}
            </Descriptions.Item>
            <Descriptions.Item label="SKU名称" span={2}>
              {reviewData.sku_name}
            </Descriptions.Item>
            <Descriptions.Item label="采购数量">
              {reviewData.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="报价金额">
              {formatPriceToYuan(reviewData.quote_price)}
            </Descriptions.Item>
            <Descriptions.Item label="采购总金额">
              {formatPriceToYuan(reviewData.total_price)}
            </Descriptions.Item>
            <Descriptions.Item label="报价状态">
              <Tag color="orange">{reviewData.status?.name || '待审批'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="期望交货日期">
              {formatDate(reviewData.expected_delivery_date, true)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {reviewData.remark || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {formatDate(reviewData.submit_time)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDate(reviewData.ctime)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatDate(reviewData.mtime)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card>
          <Row justify="center">
            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={handleApprove}
                style={{ minWidth: 120 }}
              >
                通过
              </Button>
              <Button
                danger
                size="large"
                onClick={handleReject}
                style={{ minWidth: 120 }}
              >
                驳回
              </Button>
            </Space>
          </Row>
        </Card>
      </Card>
    </div>
  );
};

export default ReviewDetail;
