import type { PurchaseOrderDetailResponse } from '@/services/purchase/typings.d';
import { Card, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { formatDate, PurchaseStatusColorMap } from '../utils';

interface BasicInfoCardProps {
  purchase: PurchaseOrderDetailResponse;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ purchase }) => {
  // 计算最晚的到货时间
  const latestDeliveryDate = React.useMemo(() => {
    if (!purchase.items || purchase.items.length === 0) {
      return null;
    }

    const validDates = purchase.items
      .map((item) => item.delivery_date)
      .filter((date) => date && date.trim() !== '');

    if (validDates.length === 0) {
      return null;
    }

    // 找到最晚的日期
    const latest = validDates.reduce((latestDate, currentDate) => {
      const latest = dayjs(latestDate);
      const current = dayjs(currentDate);
      return current.isAfter(latest) ? currentDate : latestDate;
    }, validDates[0]);

    return latest;
  }, [purchase.items]);

  return (
    <Card title="基本信息" size="small">
      <Descriptions column={3} bordered>
        <Descriptions.Item label="采购单号">
          {String(purchase.order_no)}
        </Descriptions.Item>
        <Descriptions.Item label="采购门店">
          {purchase.store_name}
        </Descriptions.Item>
        <Descriptions.Item label="采购人">
          {purchase.creator_name}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {formatDate(purchase.ctime)}
        </Descriptions.Item>
        <Descriptions.Item label="全部商品到货时间">
          {formatDate(latestDeliveryDate, true)}
        </Descriptions.Item>
        <Descriptions.Item label="期望到货日期">
          {purchase.expected_delivery_date}
        </Descriptions.Item>
        <Descriptions.Item label="询价截止时间">
          {formatDate(purchase.inquiry_deadline)}
        </Descriptions.Item>
        <Descriptions.Item label="配件数量">
          {purchase.items?.length || 0}
        </Descriptions.Item>
        <Descriptions.Item label="当前状态">
          <Tag color={PurchaseStatusColorMap[purchase.status?.code]}>
            {purchase.status.name}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>
          {purchase.remark || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default BasicInfoCard;
