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

  // 审核通过
  const handleApprove = async () => {
    if (!purchase) return;

    try {
      await PurchaseAPI.approvePurchase(purchase.id);
      message.success('审核通过');
      fetchPurchaseDetail();
    } catch (error) {
      message.error('审核失败');
    }
  };

  // 驳回采购单
  const handleReject = async () => {
    if (!purchase || !rejectReason.trim()) {
      message.error('请填写驳回原因');
      return;
    }

    try {
      await PurchaseAPI.rejectPurchase(purchase.id, rejectReason);
      message.success('驳回成功');
      setRejectModalVisible(false);
      setRejectReason('');
      fetchPurchaseDetail();
    } catch (error) {
      message.error('驳回失败');
    }
  };

  // 获取状态颜色
  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return 'default'; // 草稿
      case 2:
        return 'processing'; // 待审核
      case 3:
        return 'success'; // 审核通过
      case 4:
        return 'error'; // 已驳回
      case 5:
        return 'warning'; // 待询价
      case 6:
        return 'blue'; // 已报价
      case 7:
        return 'orange'; // 订单待审核
      case 8:
        return 'purple'; // 已下单
      case 9:
        return 'green'; // 已完成
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
          await PurchaseAPI.submitOrder(purchase.id);
          message.success('订单提交成功，待审核');
          fetchPurchaseDetail(); // 重新获取数据
        } catch (error) {
          message.error('订单提交失败');
        }
      },
    });
  };

  // 审核订单通过
  const handleApproveOrder = async () => {
    if (!purchase) return;

    try {
      await PurchaseAPI.approveOrder(purchase.id);
      message.success('订单审核通过');
      fetchPurchaseDetail();
    } catch (error) {
      message.error('审核失败');
    }
  };

  // 驳回订单
  const handleRejectOrder = async () => {
    if (!purchase || !rejectReason.trim()) {
      message.error('请填写驳回原因');
      return;
    }

    try {
      await PurchaseAPI.rejectOrder(purchase.id, rejectReason);
      message.success('订单驳回成功');
      setRejectModalVisible(false);
      setRejectReason('');
      fetchPurchaseDetail();
    } catch (error) {
      message.error('驳回失败');
    }
  };

  // 获取可执行的操作
  const getAvailableActions = () => {
    if (!purchase) return [];

    const actions = [];
    const status = purchase.status.code;

    if (status === 1) {
      // 草稿状态
      actions.push(
        <Button key="submit" type="primary" onClick={handleSubmit}>
          提交
        </Button>,
      );
    }

    if (status === 2) {
      // 待审核状态
      actions.push(
        <Button key="approve" type="primary" onClick={handleApprove}>
          审核通过
        </Button>,
      );
      actions.push(
        <Button key="reject" onClick={() => setRejectModalVisible(true)}>
          驳回
        </Button>,
      );
    }

    if (status === 5) {
      // 待询价状态
      actions.push(
        <Button key="inquiry" type="primary" onClick={goToInquiry}>
          进入询价
        </Button>,
      );
    }

    if (status === 6) {
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

    if (status === 7) {
      // 订单待审核状态
      actions.push(
        <Button key="approve-order" type="primary" onClick={handleApproveOrder}>
          审核通过
        </Button>,
      );
      actions.push(
        <Button key="reject-order" onClick={() => setRejectModalVisible(true)}>
          驳回
        </Button>,
      );
    }

    return actions;
  };

  // 配件清单表格列
  const partColumns = [
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
              采购单详情 - {purchase.purchase_no}
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
                  {purchase.purchase_no}
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
                dataSource={purchase.purchase_details}
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
                  <p>创建采购单</p>
                  <p style={{ color: '#666' }}>
                    {purchase.creator_name} 于 {purchase.create_time}
                  </p>
                </Timeline.Item>
                {purchase.status.code >= 2 && (
                  <Timeline.Item color="blue">
                    <p>提交审核</p>
                    <p style={{ color: '#666' }}>已提交待审核</p>
                  </Timeline.Item>
                )}
                {purchase.status.code === 3 && (
                  <Timeline.Item color="green">
                    <p>审核通过</p>
                    <p style={{ color: '#666' }}>审核员审核通过</p>
                  </Timeline.Item>
                )}
                {purchase.status.code === 4 && (
                  <Timeline.Item color="red">
                    <p>审核驳回</p>
                    <p style={{ color: '#666' }}>审核员驳回申请</p>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 驳回原因弹窗 */}
      <Modal
        title={purchase?.status.code === 7 ? '驳回订单' : '驳回采购单'}
        open={rejectModalVisible}
        onOk={purchase?.status.code === 7 ? handleRejectOrder : handleReject}
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
