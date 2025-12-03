import { PurchaseAPI, PurchaseOrderDetailResponse } from '@/services/purchase';
import { OrderQuoteDetailResponse, QuoteAPI } from '@/services/quote';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Result,
  Row,
  Space,
  Spin,
  Tag,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BasicInfoCard from './components/BasicInfoCard';
import ConfirmArrivalModal from './components/ConfirmArrivalModal';
import PartListCard from './components/PartListCard';
import SelectSupplierModal from './components/SelectSupplierModal';
import StatusTimelineCard from './components/StatusTimelineCard';
import SupplierQuotesCard from './components/SupplierQuotesCard';
import { OrderStatus } from './constants';
import {
  buildItemQuoteData,
  buildSelectionsFromPurchaseItems,
  getOrderItemKey,
  getPurchaseStatusColor,
  SelectedSupplierMap,
} from './utils';

const PurchaseDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseOrderDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<OrderQuoteDetailResponse[]>([]);
  const [selectSupplierModalVisible, setSelectSupplierModalVisible] =
    useState(false);
  const [selectedSuppliers, setSelectedSuppliers] =
    useState<SelectedSupplierMap>({});
  const [confirmArrivalModalVisible, setConfirmArrivalModalVisible] =
    useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

      if (purchaseData.status.code >= OrderStatus.INQUIRING) {
        try {
          const quoteResponse = await QuoteAPI.getSupplierQuotesByOrder(
            purchaseData.order_no,
          );
          const quotesData = quoteResponse.data || [];
          setQuotes(quotesData);

          // 构建 selectedSuppliers，从报价数据中获取 quote_no
          if (purchaseData.status.code >= OrderStatus.QUOTED) {
            const selections: SelectedSupplierMap = {};
            purchaseData.items?.forEach((item) => {
              if (!item.supplier_name) {
                return;
              }
              const key = getOrderItemKey(item);
              const matchedQuote = quotesData.find(
                (quote) => quote.supplier_name === item.supplier_name,
              );
              if (!matchedQuote) {
                selections[key] = {
                  quote_no: '',
                  supplier_name: item.supplier_name,
                  inquiry_item_id: 0,
                  sku_id: item.sku_id.toString(),
                  order_item_id: item.id,
                };
                return;
              }

              const matchedQuoteItem = matchedQuote.items.find(
                (quoteItem) => String(quoteItem.sku_id) === String(item.sku_id),
              );

              if (matchedQuoteItem) {
                selections[key] = {
                  quote_no: String(matchedQuoteItem.quote_no),
                  supplier_name: matchedQuote.supplier_name,
                  inquiry_item_id: matchedQuoteItem.inquiry_item_id || 0,
                  sku_id: matchedQuoteItem.sku_id,
                  order_item_id: item.id,
                };
              } else {
                selections[key] = {
                  quote_no: '',
                  supplier_name: item.supplier_name,
                  inquiry_item_id: 0,
                  sku_id: item.sku_id.toString(),
                  order_item_id: item.id,
                };
              }
            });
            setSelectedSuppliers(selections);
          } else {
            setSelectedSuppliers({});
          }
        } catch (error) {
          console.error('获取报价失败', error);
          setQuotes([]);
          if (purchaseData.status.code >= OrderStatus.QUOTED) {
            setSelectedSuppliers(
              buildSelectionsFromPurchaseItems(purchaseData.items || []),
            );
          } else {
            setSelectedSuppliers({});
          }
        }
      } else {
        setQuotes([]);
        setSelectedSuppliers({});
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

  const handleItemSupplierChange = (
    itemKey: string,
    quoteNo: string,
    supplierName: string,
    inquiryItemId?: number,
    skuId?: number | string,
    orderItemId?: number,
  ) => {
    setSelectedSuppliers((prev) => ({
      ...prev,
      [itemKey]: {
        quote_no: quoteNo,
        supplier_name: supplierName,
        inquiry_item_id: inquiryItemId,
        sku_id: skuId,
        order_item_id: orderItemId,
      },
    }));
  };

  const confirmSelectSuppliers = async () => {
    if (!purchase) {
      return;
    }
    setConfirmLoading(true);
    const submitItems = Object.values(selectedSuppliers)
      .filter((item) => !!item.quote_no && item.order_item_id)
      .map((item) => ({
        order_item_id: item.order_item_id as number,
        quote_no: Number(item.quote_no.toString()),
      }));

    if (submitItems.length === 0) {
      message.warning('请至少选择一个商品的供应商');
      return;
    }

    try {
      await QuoteAPI.selectSuppliersByItems({
        order_no: purchase.order_no,
        items: submitItems,
      });
      message.success('供应商选择成功，订单已下单');
      setSelectSupplierModalVisible(false);
      fetchPurchaseDetail();
      setConfirmLoading(false);
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

  const handleConfirmArrival = () => {
    if (!purchase) return;

    // 检查是否有已选中供应商的配件
    // 在 ORDERED 状态下，只要有 supplier_name 就应该允许确认到货
    const hasAvailableItems = purchase.items?.some(
      (item) => item.supplier_name,
    );

    if (!hasAvailableItems) {
      message.warning('没有已选中供应商的配件，无法确认到货');
      return;
    }

    // 打开确认到货弹窗
    setConfirmArrivalModalVisible(true);
  };

  const handleConfirmArrivalSubmit = async (quoteNos: number[]) => {
    if (quoteNos.length === 0) {
      message.warning('请至少选择一个配件');
      return;
    }

    try {
      await PurchaseAPI.confirmArrival(quoteNos);
      message.success('到货确认成功');
      setConfirmArrivalModalVisible(false);
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '确认失败');
    }
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
              采购单详情 - {String(purchase.order_no)}
            </span>
            <Tag color={getPurchaseStatusColor(purchase.status.code)}>
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
              getStatusColor={getPurchaseStatusColor}
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
            <StatusTimelineCard orderNo={purchase.order_no} />
          </Col>
        </Row>
      </Card>

      <SelectSupplierModal
        visible={selectSupplierModalVisible}
        onOk={confirmSelectSuppliers}
        confirmLoading={confirmLoading}
        onCancel={() => setSelectSupplierModalVisible(false)}
        selectedSuppliers={selectedSuppliers}
        itemQuoteData={itemQuoteData}
      />

      <ConfirmArrivalModal
        visible={confirmArrivalModalVisible}
        items={purchase?.items || []}
        onOk={handleConfirmArrivalSubmit}
        onCancel={() => setConfirmArrivalModalVisible(false)}
      />
    </div>
  );
};

export default PurchaseDetail;
