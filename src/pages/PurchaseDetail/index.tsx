import { PurchaseAPI } from '@/services/purchase';
import type { PurchaseItem } from '@/services/purchase/typings.d';
import { QuoteAPI, SupplierQuoteSummary } from '@/services/quote';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Result,
  Row,
  Space,
  Spin,
  Tag,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BasicInfoCard from './components/BasicInfoCard';
import PartListCard from './components/PartListCard';
import RejectModal from './components/RejectModal';
import SelectSupplierModal from './components/SelectSupplierModal';
import StatusTimelineCard from './components/StatusTimelineCard';
import SupplierQuotesCard from './components/SupplierQuotesCard';
import { OrderStatus } from './constants';
import {
  buildItemQuoteData,
  buildSelectionsFromPurchaseItems,
  SelectedSupplierMap,
} from './utils';

const PurchaseDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<SupplierQuoteSummary[]>([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectSupplierModalVisible, setSelectSupplierModalVisible] =
    useState(false);
  const [selectedSuppliers, setSelectedSuppliers] =
    useState<SelectedSupplierMap>({});

  const itemQuoteData = useMemo(
    () => buildItemQuoteData(purchase, quotes),
    [purchase, quotes],
  );
  const hasSupplierSelection = useMemo(
    () => Object.values(selectedSuppliers).some((item) => !!item.quote_no),
    [selectedSuppliers],
  );

  const fetchPurchaseDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const purchaseResponse = await PurchaseAPI.getPurchaseDetail(id);
      const purchaseData = purchaseResponse.data;
      setPurchase(purchaseData);

      if (purchaseData.status.code >= OrderStatus.QUOTED) {
        setSelectedSuppliers(
          buildSelectionsFromPurchaseItems(purchaseData.items || []),
        );
      } else {
        setSelectedSuppliers({});
      }

      if (purchaseData.status.code >= OrderStatus.INQUIRING) {
        try {
          const quoteResponse = await QuoteAPI.getSupplierQuotesByOrder(
            purchaseData.order_no,
          );
          setQuotes(quoteResponse.data?.quotes || []);
        } catch (error) {
          console.error('获取报价失败', error);
          setQuotes([]);
        }
      } else {
        setQuotes([]);
      }
    } catch (error) {
      message.error('获取采购单详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPurchaseDetail();
  }, [fetchPurchaseDetail]);

  const goBack = () => {
    history.push('/purchase');
  };

  const goToInquiry = () => {
    if (purchase) {
      history.push(`/purchase/${purchase.id}/inquiry`);
    }
  };

  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case OrderStatus.DRAFT:
        return 'default';
      case OrderStatus.PENDING_APPROVAL:
        return 'processing';
      case OrderStatus.APPROVAL_REJECTED:
        return 'error';
      case OrderStatus.INQUIRING:
        return 'warning';
      case OrderStatus.QUOTED:
        return 'blue';
      case OrderStatus.PRICE_PENDING_APPROVAL:
        return 'orange';
      case OrderStatus.PRICE_APPROVAL_REJECTED:
        return 'error';
      case OrderStatus.ORDERED:
        return 'purple';
      case OrderStatus.ARRIVED:
        return 'success';
      default:
        return 'default';
    }
  };

  const handleItemSupplierChange = (
    itemKey: string,
    quoteNo: string,
    supplierName: string,
    inquiryItemId: number,
  ) => {
    setSelectedSuppliers((prev) => ({
      ...prev,
      [itemKey]: {
        quote_no: quoteNo,
        supplier_name: supplierName,
        inquiry_item_id: inquiryItemId,
      },
    }));
  };

  const confirmSelectSuppliers = async () => {
    if (!purchase) {
      return;
    }
    const selections = Object.values(selectedSuppliers).filter(
      (item) => !!item.quote_no,
    );
    if (selections.length === 0) {
      message.warning('请至少选择一个商品的供应商');
      return;
    }

    try {
      await QuoteAPI.selectSuppliersByItems({
        order_no: purchase.order_no,
        selections: selections.map((item) => ({
          inquiry_item_id: item.inquiry_item_id,
          quote_no: item.quote_no,
        })),
      });
      message.success('供应商选择成功，订单已下单');
      setSelectSupplierModalVisible(false);
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '选择供应商失败');
      console.error(error);
    }
  };

  const handleApprovePriceRequest = async () => {
    if (!purchase) return;
    try {
      // await PurchaseAPI.approvePriceRequest(purchase.id);
      message.success('价格审批通过');
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '审批失败');
    }
  };

  const handleRejectPriceRequest = async () => {
    if (!purchase) return;
    if (!rejectReason.trim()) {
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
      message.error(error?.message || '驳回失败');
    }
  };

  const handleConfirmArrival = () => {
    if (!purchase) return;
    Modal.confirm({
      title: '确认到货',
      content: '请确认货物已全部到货，确认后将更新采购单状态为“已到货”。',
      onOk: async () => {
        try {
          // await PurchaseAPI.confirmArrival(purchase.id);
          message.success('到货确认成功');
          fetchPurchaseDetail();
        } catch (error: any) {
          message.error(error?.message || '确认失败');
        }
      },
    });
  };

  const handleSubmitOrder = () => {
    if (!purchase) return;
    const selectedQuote = quotes.find((q) => q.status?.code === 2);
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
          fetchPurchaseDetail();
        } catch (error) {
          message.error('订单提交失败');
        }
      },
    });
  };

  const getAvailableActions = () => {
    if (!purchase) return [];
    const status = purchase.status.code;
    const actions: React.ReactNode[] = [];

    if (status === OrderStatus.PENDING_APPROVAL) {
      actions.push(
        <Button key="pending" type="default" disabled>
          待审核（第一版自动审核）
        </Button>,
      );
    }

    if (status === OrderStatus.APPROVAL_REJECTED) {
      actions.push(
        <Button key="approval-rejected" danger disabled>
          审核已驳回
        </Button>,
      );
    }

    if (status === OrderStatus.INQUIRING) {
      actions.push(
        <Button key="inquiry" type="primary" onClick={goToInquiry}>
          查看询价进度
        </Button>,
      );
    }

    if (status === OrderStatus.QUOTED) {
      actions.push(
        <Button key="quoted" onClick={goToInquiry}>
          查看报价
        </Button>,
      );
      const hasSelectedQuote = quotes.some((q) => q.status?.code === 2);
      actions.push(
        <Button
          key="submit-order"
          type="primary"
          onClick={handleSubmitOrder}
          disabled={!hasSelectedQuote}
        >
          {hasSelectedQuote ? '提交订单' : '请先选择供应商'}
        </Button>,
      );
    }

    if (status === OrderStatus.PRICE_PENDING_APPROVAL) {
      actions.push(
        <Button
          key="price-approve"
          type="primary"
          onClick={handleApprovePriceRequest}
        >
          价格审批通过
        </Button>,
      );
      actions.push(
        <Button key="price-reject" onClick={() => setRejectModalVisible(true)}>
          价格审批驳回
        </Button>,
      );
    }

    if (status === OrderStatus.PRICE_APPROVAL_REJECTED) {
      actions.push(
        <Button key="price-rejected" danger disabled>
          价格审批已驳回
        </Button>,
      );
    }

    if (status === OrderStatus.ORDERED) {
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
      actions.push(
        <Button key="completed" type="default" disabled>
          已完成
        </Button>,
      );
    }

    return actions;
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
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
          <Col span={24}>
            <BasicInfoCard
              purchase={purchase}
              getStatusColor={getStatusColor}
            />
          </Col>

          <Col span={24}>
            <PartListCard items={purchase.items} />
          </Col>

          <Col span={24}>
            <SupplierQuotesCard
              visible={purchase.status.code >= OrderStatus.INQUIRING}
              itemQuoteData={itemQuoteData}
              selectedSuppliers={selectedSuppliers}
              onSelectSupplier={handleItemSupplierChange}
              canConfirm={hasSupplierSelection}
              onOpenConfirmModal={() => setSelectSupplierModalVisible(true)}
              purchaseStatus={purchase.status.code}
              selectionEnabled={purchase.status.code === OrderStatus.INQUIRING}
            />
          </Col>

          <Col span={24}>
            <StatusTimelineCard purchase={purchase} />
          </Col>
        </Row>
      </Card>

      <RejectModal
        visible={rejectModalVisible}
        reason={rejectReason}
        onChange={setRejectReason}
        onOk={handleRejectPriceRequest}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
      />

      <SelectSupplierModal
        visible={selectSupplierModalVisible}
        onOk={confirmSelectSuppliers}
        onCancel={() => setSelectSupplierModalVisible(false)}
        selectedSuppliers={selectedSuppliers}
        itemQuoteData={itemQuoteData}
      />
    </div>
  );
};

export default PurchaseDetail;
