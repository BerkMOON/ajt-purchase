import {
  ConfirmArrivalItemParams,
  PurchaseAPI,
  PurchaseOrderDetailResponse,
  SkuList,
} from '@/services/purchase';
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
import ConfirmOrderModal from './components/ConfirmOrderModal';
import PartListCard from './components/PartListCard';
import SelectSupplierModal from './components/SelectSupplierModal';
import SendInquiryModal from './components/SendInquiryModal';
import StatusTimelineCard from './components/StatusTimelineCard';
import SupplierQuotesCard from './components/SupplierQuotesCard';
import { OrderItemStatus, OrderStatus } from './constants';
import {
  buildItemQuoteData,
  buildSelectionsFromPurchaseItems,
  getOrderItemKey,
  PurchaseStatusColorMap,
  SelectedSupplierMap,
} from './utils';

const PurchaseDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseOrderDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<SkuList[]>([]);
  const [selectSupplierModalVisible, setSelectSupplierModalVisible] =
    useState(false);
  const [selectedSuppliers, setSelectedSuppliers] =
    useState<SelectedSupplierMap>({});
  const [confirmArrivalModalVisible, setConfirmArrivalModalVisible] =
    useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmOrderModalVisible, setConfirmOrderModalVisible] =
    useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [sendInquiryModalVisible, setSendInquiryModalVisible] = useState(false);
  const [sendInquiryLoading, setSendInquiryLoading] = useState(false);

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
          const quoteResponse = await PurchaseAPI.getSupplierQuotesByOrder(
            purchaseData.order_no,
          );
          const quotesData = quoteResponse.data?.sku_list || [];
          setQuotes(quotesData);

          // 构建 selectedSuppliers，从报价数据中获取 quote_no
          if (purchaseData.status.code >= OrderStatus.QUOTED) {
            const selections: SelectedSupplierMap = {};
            purchaseData.items?.forEach((item) => {
              if (!item.supplier_name) {
                return;
              }
              const key = getOrderItemKey(item);

              // 从新的报价数据结构中查找匹配的报价
              let matchedQuoteNo = '';
              let matchedInquiryNo = 0;

              const skuQuote = quotesData.find(
                (sq) => sq.sku_id === item.sku_id,
              );

              if (skuQuote) {
                const matchedQuoteItem = skuQuote.quote_items.find(
                  (qi) => qi.supplier_name === item.supplier_name,
                );

                if (matchedQuoteItem) {
                  matchedQuoteNo = String(matchedQuoteItem.quote_no);
                  matchedInquiryNo = matchedQuoteItem.inquiry_no;
                }
              }

              selections[key] = {
                quote_no: matchedQuoteNo,
                supplier_name: item.supplier_name,
                inquiry_item_id: matchedInquiryNo,
                sku_id: item.sku_id.toString(),
                order_item_id: item.id,
              };
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
    setSelectedSuppliers((prev) => {
      const currentSelection = prev[itemKey];
      // 如果点击的是已选中的项，则取消选择
      if (currentSelection?.quote_no === quoteNo) {
        const newState = { ...prev };
        delete newState[itemKey];
        return newState;
      }
      // 否则设置为新的选择
      return {
        ...prev,
        [itemKey]: {
          quote_no: quoteNo,
          supplier_name: supplierName,
          inquiry_item_id: inquiryItemId,
          sku_id: skuId,
          order_item_id: orderItemId,
        },
      };
    });
  };

  const confirmSelectSuppliers = async () => {
    if (!purchase) {
      return;
    }
    setConfirmLoading(true);

    // 过滤出已选择供应商的商品
    const validSelections = Object.values(selectedSuppliers).filter(
      (item) =>
        !!item.quote_no &&
        item.inquiry_item_id &&
        item.sku_id !== undefined &&
        item.sku_id !== null,
    );

    if (validSelections.length === 0) {
      message.warning('请至少选择一个商品的供应商');
      setConfirmLoading(false);
      return;
    }

    try {
      // 循环调用接口，每个 SKU 单独请求一次
      const promises = validSelections.map((item) => {
        const params = {
          inquiry_no: Number(item.inquiry_item_id),
          order_no: Number(purchase.order_no),
          quote_no: Number(item.quote_no),
          sku_id: Number(item.sku_id),
        };
        return PurchaseAPI.selectSuppliersByItems(params);
      });

      // 等待所有请求完成
      await Promise.all(promises);
      message.success('供应商选择成功，订单已下单');
      setSelectSupplierModalVisible(false);
      fetchPurchaseDetail();
      setConfirmLoading(false);
    } catch (error: any) {
      message.error(error?.message || '选择供应商失败');
      console.error(error);
      setConfirmLoading(false);
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

  const handleConfirmArrivalSubmit = async (
    arrivalItems: ConfirmArrivalItemParams[],
  ) => {
    if (!purchase || arrivalItems.length === 0) {
      message.warning('请至少选择一个配件');
      return;
    }

    try {
      await PurchaseAPI.confirmArrival({
        order_no: purchase.order_no,
        items: arrivalItems,
      });
      message.success('到货确认成功');
      setConfirmArrivalModalVisible(false);
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '确认失败');
    }
  };

  const handleSendInquiry = () => {
    if (!purchase) {
      message.error('采购单信息不存在');
      return;
    }
    setSendInquiryModalVisible(true);
  };

  const handleSendInquirySubmit = async (deadline: string) => {
    if (!purchase) {
      return;
    }

    try {
      setSendInquiryLoading(true);
      await PurchaseAPI.sendSupplierInquiry({
        order_no: purchase.order_no,
        deadline: deadline,
      });
      message.success('询价发送成功');
      setSendInquiryModalVisible(false);
      // 刷新采购单详情
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '发起询价失败');
      console.error('发起询价失败:', error);
    } finally {
      setSendInquiryLoading(false);
    }
  };

  const handleEndInquiry = async () => {
    if (!purchase) return;
    try {
      await PurchaseAPI.endInquiry(purchase.order_no);
      message.success('已结束询价，请选择供应商报价');
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '结束询价失败');
      console.error('结束询价失败:', error);
    }
  };

  const handleConfirmOrder = () => {
    if (!purchase) return;

    // 检查是否有状态为"已选中"的商品
    const hasSelectedItems = purchase.items?.some(
      (item) => item.status.code === OrderItemStatus.SELECTED,
    );

    if (!hasSelectedItems) {
      message.warning('没有可下单的商品，请先选择供应商');
      return;
    }

    // 打开下单弹窗
    setConfirmOrderModalVisible(true);
  };

  const handleConfirmOrderSubmit = async (skuIdList: number[]) => {
    if (!purchase) return;
    try {
      setOrderLoading(true);
      await PurchaseAPI.confirmOrder({
        order_no: purchase.order_no,
        sku_id_list: skuIdList,
      });
      message.success('下单成功');
      setConfirmOrderModalVisible(false);
      fetchPurchaseDetail();
    } catch (error: any) {
      message.error(error?.message || '下单失败');
      console.error('下单失败:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const getAvailableActions = () => {
    if (!purchase) return [];
    const status = purchase.status.code;
    const actions: React.ReactNode[] = [];

    if (status === OrderStatus.AWAIT_INQUIRY) {
      actions.push(
        <Button key="send-inquiry" type="primary" onClick={handleSendInquiry}>
          发起询价
        </Button>,
      );
    }

    if (status === OrderStatus.INQUIRING) {
      actions.push(
        <Button key="end-inquiry" type="primary" onClick={handleEndInquiry}>
          结束询价
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

    // 检查是否有状态为"已选中"的商品，显示下单按钮
    const hasSelectedItems = purchase.items?.some(
      (item) => item.status.code === OrderItemStatus.SELECTED,
    );
    if (hasSelectedItems) {
      actions.push(
        <Button key="confirm-order" type="primary" onClick={handleConfirmOrder}>
          下单
        </Button>,
      );
    }

    const hasAvailableItems = purchase.items?.some(
      (item) => item.status.code >= OrderItemStatus.ORDERED,
    );
    if (hasAvailableItems) {
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
            <Tag color={PurchaseStatusColorMap[purchase.status?.code]}>
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
            <BasicInfoCard purchase={purchase} />
          </Col>

          <Col span={24}>
            <PartListCard items={purchase.items} quotes={quotes} />
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
              selectionEnabled={
                purchase.status.code === OrderStatus.INQUIRY_COMPLETED
              }
            />
          </Col>

          <Col span={24}>
            <StatusTimelineCard
              orderNo={purchase.order_no}
              items={purchase.items}
            />
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

      <ConfirmOrderModal
        visible={confirmOrderModalVisible}
        items={purchase?.items || []}
        onOk={handleConfirmOrderSubmit}
        onCancel={() => setConfirmOrderModalVisible(false)}
        loading={orderLoading}
      />

      <SendInquiryModal
        visible={sendInquiryModalVisible}
        defaultDeadline={purchase?.inquiry_deadline}
        loading={sendInquiryLoading}
        onOk={handleSendInquirySubmit}
        onCancel={() => setSendInquiryModalVisible(false)}
      />
    </div>
  );
};

export default PurchaseDetail;
