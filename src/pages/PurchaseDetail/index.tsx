import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { PurchaseItem } from '@/services/purchase/typings';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  message,
  Modal,
  Result,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

// 订单状态枚举
const OrderStatus = {
  DRAFT: 1, // 草稿
  PENDING_INQUIRY: 2, // 待询价
  QUOTED: 3, // 已报价
  PRICE_PENDING_APPROVAL: 4, // 价格待审批
  ORDERED: 5, // 已下单
  ARRIVED: 6, // 已到货
} as const;

const PurchaseDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [quotes, setQuotes] = useState<any[]>([]);

  // 获取采购单详情
  const fetchPurchaseDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [purchaseResponse, quotesResponse] = await Promise.all([
        PurchaseAPI.getPurchaseDetail(id),
        PurchaseAPI.getPurchaseQuotes(id),
      ]);

      setPurchase(purchaseResponse.data);
      setQuotes(quotesResponse.data || []);
    } catch (error) {
      message.error('获取采购单详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseDetail();
  }, [id]);

  // 返回列表页
  const goBack = () => {
    history.push('/purchase');
  };

  // 提交采购单
  const handleSubmit = async () => {
    if (!purchase) return;

    try {
      await PurchaseAPI.submitPurchase(purchase.id);
      message.success('提交成功');
      fetchPurchaseDetail();
    } catch (error) {
      message.error('提交失败');
    }
  };

  // 【已删除】审核通过 - 第一轮审核已取消
  // 【已删除】驳回采购单 - 第一轮审核已取消

  // 获取状态颜色
  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case OrderStatus.DRAFT:
        return 'default'; // 草稿
      case OrderStatus.PENDING_INQUIRY:
        return 'warning'; // 待询价
      case OrderStatus.QUOTED:
        return 'blue'; // 已报价
      case OrderStatus.PRICE_PENDING_APPROVAL:
        return 'orange'; // 价格待审批
      case OrderStatus.ORDERED:
        return 'purple'; // 已下单
      case OrderStatus.ARRIVED:
        return 'success'; // 已到货
      default:
        return 'default';
    }
  };

  // 进入询价页面
  const goToInquiry = () => {
    if (purchase) {
      history.push(`/purchase/${purchase.id}/inquiry`);
    }
  };

  // 提交订单
  const handleSubmitOrder = async () => {
    if (!purchase) return;

    const selectedQuote = quotes.find((q: any) => q.status === 'selected');
    if (!selectedQuote) {
      message.warning('请先在询价页面选择供应商');
      return;
    }

    Modal.confirm({
      title: '确认提交订单',
      content: `确定为供应商 ${selectedQuote.supplier_name} 提交采购订单吗？提交后需要审核通过才能正式下单。`,
      onOk: async () => {
        try {
          // await PurchaseAPI.submitOrder(purchase.id);
          message.success('订单提交成功，待审核');
          fetchPurchaseDetail(); // 重新获取数据
        } catch (error) {
          message.error('订单提交失败');
        }
      },
    });
  };

  // 【新增】价格审批通过
  const handleApprovePriceRequest = async () => {
    if (!purchase) return;

    try {
      // await PurchaseAPI.approvePriceRequest(purchase.id);
      message.success('价格审批通过');
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error.message || '审批失败');
    }
  };

  // 【新增】价格审批驳回
  const handleRejectPriceRequest = async () => {
    if (!purchase || !rejectReason.trim()) {
      message.error('请填写驳回原因');
      return;
    }

    try {
      // await PurchaseAPI.rejectPriceRequest(purchase.id, rejectReason);
      message.success('价格审批驳回，需重新询价');
      setRejectModalVisible(false);
      setRejectReason('');
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error.message || '驳回失败');
    }
  };

  // 【新增】确认到货
  const handleConfirmArrival = () => {
    if (!purchase) return;

    Modal.confirm({
      title: '确认到货',
      content: '请确认货物已全部到货，确认后将更新采购单状态为"已到货"',
      onOk: async () => {
        try {
          // const arrivalDate = new Date().toISOString().split('T')[0];
          // await PurchaseAPI.confirmArrival(purchase.id, arrivalDate);
          message.success('到货确认成功');
          fetchPurchaseDetail();
        } catch (error: any) {
          message.error(error.message || '确认失败');
        }
      },
    });
  };

  // 获取可执行的操作
  const getAvailableActions = () => {
    if (!purchase) return [];

    const actions = [];
    const status = purchase.status.code;

    if (status === OrderStatus.DRAFT) {
      // 草稿状态
      actions.push(
        <Button key="submit" type="primary" onClick={handleSubmit}>
          提交审核
        </Button>,
      );
    }

    if (status === OrderStatus.PENDING_INQUIRY) {
      // 待询价状态
      actions.push(
        <Button key="inquiry" type="primary" onClick={goToInquiry}>
          进入询价
        </Button>,
      );
    }

    if (status === OrderStatus.QUOTED) {
      // 已报价状态
      actions.push(
        <Button key="inquiry" onClick={goToInquiry}>
          查看报价
        </Button>,
      );

      // 检查是否有选中的供应商
      const hasSelectedSupplier = quotes.some(
        (q: any) => q.status === 'selected',
      );
      if (hasSelectedSupplier) {
        actions.push(
          <Button key="submit-order" type="primary" onClick={handleSubmitOrder}>
            提交订单
          </Button>,
        );
      } else {
        actions.push(
          <Button key="select-supplier" type="primary" disabled>
            请先选择供应商
          </Button>,
        );
      }
    }

    if (status === OrderStatus.PRICE_PENDING_APPROVAL) {
      // 价格待审批状态
      actions.push(
        <Button
          key="approve-price"
          type="primary"
          onClick={handleApprovePriceRequest}
        >
          价格审批通过
        </Button>,
      );
      actions.push(
        <Button key="reject-price" onClick={() => setRejectModalVisible(true)}>
          价格审批驳回
        </Button>,
      );
    }

    if (status === OrderStatus.ORDERED) {
      // 已下单状态
      actions.push(
        <Button
          key="confirm-arrival"
          type="primary"
          onClick={handleConfirmArrival}
        >
          确认到货
        </Button>,
      );
    }

    if (status === OrderStatus.ARRIVED) {
      // 已到货状态（完成）
      actions.push(
        <Button key="completed" type="default" disabled>
          已完成
        </Button>,
      );
    }

    return actions;
  };

  // 配件清单表格列
  const partColumns = [
    {
      title: '配件类型',
      dataIndex: 'part_type',
      key: 'part_type',
      render: (type: string) => {
        // 暂时只支持备件
        if (type === 'PARTS') {
          return <Tag color="blue">备件</Tag>;
        }
        return <Tag>未知</Tag>;
      },
    },
    {
      title: '配件编码',
      dataIndex: 'part_code',
      key: 'part_code',
    },
    {
      title: '配件名称',
      dataIndex: 'part_name',
      key: 'part_name',
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
    },
    {
      title: '采购数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '历史均价',
      dataIndex: 'historical_avg_price',
      key: 'historical_avg_price',
      render: (price: number) => (price ? `¥${price.toFixed(2)}` : '-'),
    },
  ];

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!purchase) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="采购单不存在"
        extra={
          <Button type="primary" onClick={goBack}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        {/* 头部操作栏 */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
              返回
            </Button>
            <Divider type="vertical" />
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>
              采购单详情 - {purchase.order_no}
            </span>
            <Tag color={getStatusColor(purchase.status.code)}>
              {purchase.status.name}
            </Tag>
          </Space>
          <div style={{ float: 'right' }}>
            <Space>{getAvailableActions()}</Space>
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        <Row gutter={[24, 24]}>
          {/* 基本信息 */}
          <Col span={24}>
            <Card title="基本信息" size="small">
              <Descriptions column={3} bordered>
                <Descriptions.Item label="采购单号">
                  {purchase.order_no}
                </Descriptions.Item>
                <Descriptions.Item label="采购门店">
                  {purchase.store_name}
                </Descriptions.Item>
                <Descriptions.Item label="采购人">
                  {purchase.creator_name}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {purchase.create_time}
                </Descriptions.Item>
                <Descriptions.Item label="修改时间">
                  {purchase.modify_time}
                </Descriptions.Item>
                <Descriptions.Item label="期望到货日期">
                  {purchase.expected_delivery_date}
                </Descriptions.Item>
                <Descriptions.Item label="总金额">
                  ¥{purchase.total_amount?.toFixed(2) || '0.00'}
                </Descriptions.Item>
                <Descriptions.Item label="当前状态" span={2}>
                  <Tag color={getStatusColor(purchase.status.code)}>
                    {purchase.status.name}
                  </Tag>
                </Descriptions.Item>
                {purchase.remark && (
                  <Descriptions.Item label="备注" span={3}>
                    {purchase.remark}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* 配件清单 */}
          <Col span={24}>
            <Card title="配件清单" size="small">
              <Table
                columns={partColumns}
                dataSource={purchase.items}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          {/* 状态流水 */}
          <Col span={24}>
            <Card title="状态流水" size="small">
              <Timeline>
                <Timeline.Item color="green">
                  <p>
                    <strong>创建采购单</strong>
                  </p>
                  <p style={{ color: '#666' }}>
                    {purchase.creator_name} 于 {purchase.create_time}
                  </p>
                </Timeline.Item>
                {purchase.status.code >= OrderStatus.PENDING_INQUIRY && (
                  <Timeline.Item color="orange">
                    <p>
                      <strong>发送询价</strong>
                    </p>
                    <p style={{ color: '#666' }}>系统已向供应商发送询价通知</p>
                  </Timeline.Item>
                )}
                {purchase.status.code >= OrderStatus.QUOTED && (
                  <Timeline.Item color="purple">
                    <p>
                      <strong>供应商报价</strong>
                    </p>
                    <p style={{ color: '#666' }}>
                      供应商已完成报价，可进行比价选择
                    </p>
                  </Timeline.Item>
                )}
                {purchase.status.code >= OrderStatus.PRICE_PENDING_APPROVAL && (
                  <Timeline.Item color="cyan">
                    <p>
                      <strong>价格审批中</strong>
                    </p>
                    <p style={{ color: '#666' }}>已选择供应商，等待价格审批</p>
                  </Timeline.Item>
                )}
                {purchase.status.code >= OrderStatus.ORDERED && (
                  <Timeline.Item color="green">
                    <p>
                      <strong>订单确认</strong>
                    </p>
                    <p style={{ color: '#666' }}>价格审批通过，已正式下单</p>
                  </Timeline.Item>
                )}
                {purchase.status.code === OrderStatus.ARRIVED && (
                  <Timeline.Item color="green">
                    <p>
                      <strong>订单完成</strong>
                    </p>
                    <p style={{ color: '#666' }}>货物已到货，订单完成</p>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 驳回原因弹窗 */}
      <Modal
        title="价格审批驳回"
        open={rejectModalVisible}
        onOk={handleRejectPriceRequest}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <label>驳回原因：</label>
        </div>
        <TextArea
          rows={4}
          placeholder="请输入驳回原因"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PurchaseDetail;
