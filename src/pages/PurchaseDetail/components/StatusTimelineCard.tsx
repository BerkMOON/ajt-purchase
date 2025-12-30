import { PurchaseAPI } from '@/services/purchase';
import type {
  PurchaseOrderItemResponse,
  PurchaseOrderItemStatusLog,
  PurchaseOrderStatusLog,
} from '@/services/purchase/typings.d';
import { Card, Collapse, Spin, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { OrderItemStatusColorMap, OrderItemStatusNameMap } from '../constants';
import { PurchaseStatusColorMap } from '../utils';

const { Panel } = Collapse;

interface StatusTimelineCardProps {
  orderNo: number;
  items?: PurchaseOrderItemResponse[]; // 用于获取 SKU 名称
}

const StatusTimelineCard: React.FC<StatusTimelineCardProps> = ({
  orderNo,
  items = [],
}) => {
  const [orderLogs, setOrderLogs] = useState<PurchaseOrderStatusLog[]>([]);
  const [skuLogs, setSkuLogs] = useState<PurchaseOrderItemStatusLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 创建 sku_id 到 sku_name 的映射
  const skuNameMap = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((item) => {
      map.set(item.sku_id, item.sku_name);
    });
    return map;
  }, [items]);

  useEffect(() => {
    const fetchStatusLogs = async () => {
      try {
        setLoading(true);
        const response = await PurchaseAPI.getPurchaseStatusLog(orderNo);
        const data = response.data;

        // 处理订单状态流转日志
        const orderLogsData = data.order_logs || [];
        const sortedOrderLogs = [...orderLogsData].sort((a, b) => {
          return dayjs(a.ctime).valueOf() - dayjs(b.ctime).valueOf();
        });
        setOrderLogs(sortedOrderLogs);

        // 处理 SKU 状态流转日志
        const skuLogsData = data.logs || [];
        setSkuLogs(skuLogsData);
      } catch (error) {
        console.error('获取状态日志失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderNo) {
      fetchStatusLogs();
    }
  }, [orderNo]);

  // 构建订单状态流转的时间线项
  const orderTimelineItems = useMemo(() => {
    if (orderLogs.length === 0) return [];

    const items: Array<{
      id: number | string;
      status: { code: keyof typeof PurchaseStatusColorMap; name: string };
      ctime: string;
      operator_name?: string;
      remark?: string;
      isInitial?: boolean;
    }> = [];

    // 添加初始状态（第一条记录的 from_status）
    const firstLog = orderLogs[0];
    if (firstLog) {
      items.push({
        id: 'initial',
        status: firstLog.from_status,
        ctime: firstLog.ctime,
        operator_name: firstLog.operator_name,
        remark: '创建采购单',
        isInitial: true,
      });
    }

    // 添加所有状态变更记录
    orderLogs.forEach((log) => {
      items.push({
        id: log.id,
        status: log.to_status,
        ctime: log.ctime,
        operator_name: log.operator_name,
        remark: log.remark,
        isInitial: false,
      });
    });

    return items;
  }, [orderLogs]);

  // 构建 SKU 状态流转的时间线项
  const buildSkuTimelineItems = (skuLog: PurchaseOrderItemStatusLog) => {
    if (skuLog.status_logs.length === 0) return [];

    const sortedLogs = [...skuLog.status_logs].sort((a, b) => {
      return dayjs(a.ctime).valueOf() - dayjs(b.ctime).valueOf();
    });

    const items: Array<{
      id: number | string;
      status: { code: number; name: string };
      ctime: string;
      operator_name?: string;
      remark?: string;
      quote_no?: number;
      isInitial?: boolean;
    }> = [];

    // 添加初始状态
    const firstLog = sortedLogs[0];
    if (firstLog) {
      const fromStatusCode = firstLog.from_status.code as number;
      items.push({
        id: `sku-${skuLog.sku_id}-initial`,
        status: {
          code: fromStatusCode,
          name:
            OrderItemStatusNameMap[
              fromStatusCode as keyof typeof OrderItemStatusNameMap
            ] || firstLog.from_status.name,
        },
        ctime: firstLog.ctime,
        operator_name: firstLog.operator_name,
        remark: '商品初始状态',
        isInitial: true,
      });
    }

    // 添加所有状态变更记录
    sortedLogs.forEach((log, index) => {
      const toStatusCode = log.to_status.code as number;
      items.push({
        id: `sku-${skuLog.sku_id}-${log.quote_no}-${index}`,
        status: {
          code: toStatusCode,
          name:
            OrderItemStatusNameMap[
              toStatusCode as keyof typeof OrderItemStatusNameMap
            ] || log.to_status.name,
        },
        ctime: log.ctime,
        operator_name: log.operator_name,
        remark: log.remark,
        quote_no: log.quote_no,
        isInitial: false,
      });
    });

    return items;
  };

  const renderOrderTimelineItem = (item: {
    id: number | string;
    status: { code: keyof typeof PurchaseStatusColorMap; name: string };
    ctime: string;
    operator_name?: string;
    remark?: string;
    isInitial?: boolean;
  }) => {
    const statusColor = PurchaseStatusColorMap[item.status.code];
    return (
      <Timeline.Item
        key={item.id}
        color={statusColor}
        label={
          <div
            style={{
              minWidth: 160,
              textAlign: 'right',
              paddingRight: 16,
            }}
          >
            <div style={{ color: '#666', fontSize: 12 }}>
              {dayjs(item.ctime).format('YYYY-MM-DD')}
            </div>
            <div style={{ color: '#999', fontSize: 12 }}>
              {dayjs(item.ctime).format('HH:mm:ss')}
            </div>
          </div>
        }
      >
        <div>
          <p style={{ marginBottom: 4 }}>
            <strong>{item.status.name}</strong>
          </p>
          {item.operator_name && (
            <p style={{ color: '#666', marginBottom: 4 }}>
              操作人：{item.operator_name}
            </p>
          )}
          {item.remark && (
            <p style={{ color: '#666', marginBottom: 0 }}>
              备注：{item.remark}
            </p>
          )}
        </div>
      </Timeline.Item>
    );
  };

  const renderSkuTimelineItem = (item: {
    id: number | string;
    status: { code: number; name: string };
    ctime: string;
    operator_name?: string;
    remark?: string;
    quote_no?: number;
    isInitial?: boolean;
  }) => {
    const statusCode = item.status.code as keyof typeof OrderItemStatusColorMap;
    const statusColor = OrderItemStatusColorMap[statusCode] || 'default';
    return (
      <Timeline.Item
        key={item.id}
        color={statusColor}
        label={
          <div
            style={{
              minWidth: 160,
              textAlign: 'right',
              paddingRight: 16,
            }}
          >
            <div style={{ color: '#666', fontSize: 12 }}>
              {dayjs(item.ctime).format('YYYY-MM-DD')}
            </div>
            <div style={{ color: '#999', fontSize: 12 }}>
              {dayjs(item.ctime).format('HH:mm:ss')}
            </div>
          </div>
        }
      >
        <div>
          <p style={{ marginBottom: 4 }}>
            <strong>{item.status.name}</strong>
            {item.quote_no && (
              <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                (报价单号: {item.quote_no})
              </span>
            )}
          </p>
          {item.operator_name && (
            <p style={{ color: '#666', marginBottom: 4 }}>
              操作人：{item.operator_name}
            </p>
          )}
          {item.remark && (
            <p style={{ color: '#666', marginBottom: 0 }}>
              备注：{item.remark}
            </p>
          )}
        </div>
      </Timeline.Item>
    );
  };

  if (loading) {
    return (
      <Card title="状态流水" size="small">
        <Spin />
      </Card>
    );
  }

  const hasOrderLogs = orderLogs.length > 0;
  const hasSkuLogs = skuLogs.length > 0;

  if (!hasOrderLogs && !hasSkuLogs) {
    return (
      <Card title="状态流水" size="small">
        <div style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
          暂无状态流转记录
        </div>
      </Card>
    );
  }

  return (
    <Card title="状态流水" size="small">
      {/* 订单状态流转 */}
      {hasOrderLogs && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            订单状态流转
          </div>
          <Timeline mode="left">
            {orderTimelineItems.map((item) => renderOrderTimelineItem(item))}
          </Timeline>
        </div>
      )}

      {/* SKU 状态流转 */}
      {hasSkuLogs && (
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            商品状态流转
          </div>
          <Collapse>
            {skuLogs.map((skuLog) => {
              const skuName =
                skuNameMap.get(skuLog.sku_id) || `SKU ID: ${skuLog.sku_id}`;
              const timelineItems = buildSkuTimelineItems(skuLog);

              if (timelineItems.length === 0) {
                return null;
              }

              return (
                <Panel
                  header={
                    <span>
                      {skuName}{' '}
                      <span style={{ color: '#999' }}>
                        (SKU ID: {skuLog.sku_id})
                      </span>
                    </span>
                  }
                  key={skuLog.sku_id}
                >
                  <Timeline mode="left">
                    {timelineItems.map((item) => renderSkuTimelineItem(item))}
                  </Timeline>
                </Panel>
              );
            })}
          </Collapse>
        </div>
      )}
    </Card>
  );
};

export default StatusTimelineCard;
