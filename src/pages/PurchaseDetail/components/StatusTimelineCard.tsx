import { PurchaseAPI } from '@/services/purchase';
import type { PurchaseOrderStatusLogResponse } from '@/services/purchase/typings.d';
import { Card, Spin, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { getPurchaseStatusColor } from '../utils';

interface StatusTimelineCardProps {
  orderNo: number;
}

const StatusTimelineCard: React.FC<StatusTimelineCardProps> = ({ orderNo }) => {
  const [statusLogs, setStatusLogs] = useState<
    PurchaseOrderStatusLogResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusLogs = async () => {
      try {
        setLoading(true);
        const response = await PurchaseAPI.getPurchaseStatusLog(orderNo);
        const logs = response.data.logs || [];
        // 按时间排序，最早的在前（时间线从旧到新）
        const sortedLogs = [...logs].sort((a, b) => {
          return dayjs(a.ctime).valueOf() - dayjs(b.ctime).valueOf();
        });
        setStatusLogs(sortedLogs);
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

  // 构建完整的状态序列：包括初始状态和所有状态变更
  const timelineItems = useMemo(() => {
    if (statusLogs.length === 0) return [];

    const items: Array<{
      id: number | string;
      status: { code: number; name: string };
      ctime: string;
      operator_name?: string;
      remark?: string;
      isInitial?: boolean;
    }> = [];

    // 添加初始状态（第一条记录的 from_status）
    const firstLog = statusLogs[0];
    if (firstLog) {
      items.push({
        id: 'initial',
        status: firstLog.from_status,
        ctime: firstLog.ctime, // 使用第一条记录的时间作为初始状态时间
        operator_name: firstLog.operator_name,
        remark: '创建采购单草稿',
        isInitial: true,
      });
    }

    // 添加所有状态变更记录
    statusLogs.forEach((log) => {
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
  }, [statusLogs]);

  if (loading) {
    return (
      <Card title="状态流水" size="small">
        <Spin />
      </Card>
    );
  }

  if (statusLogs.length === 0) {
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
      <Timeline mode="left">
        {timelineItems.map((item) => {
          const statusColor = getPurchaseStatusColor(item.status.code);
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
        })}
      </Timeline>
    </Card>
  );
};

export default StatusTimelineCard;
