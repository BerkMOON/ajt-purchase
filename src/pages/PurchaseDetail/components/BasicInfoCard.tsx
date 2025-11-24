import type { PurchaseItem } from '@/services/purchase/typings.d';
import { Card, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface BasicInfoCardProps {
  purchase: PurchaseItem;
  getStatusColor: (statusCode: number) => string;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  purchase,
  getStatusColor,
}) => (
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
        {dayjs(purchase.ctime).format('YYYY-MM-DD HH:mm:ss')}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {dayjs(purchase.mtime).format('YYYY-MM-DD HH:mm:ss')}
      </Descriptions.Item>
      <Descriptions.Item label="期望到货日期">
        {purchase.expected_delivery_date}
      </Descriptions.Item>
      <Descriptions.Item label="询价截止时间">
        {purchase.inquiry_deadline
          ? dayjs(purchase.inquiry_deadline).format('YYYY-MM-DD HH:mm:ss')
          : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="配件数量">
        {purchase.items?.length || 0}
      </Descriptions.Item>
      <Descriptions.Item label="当前状态">
        <Tag color={getStatusColor(purchase.status.code)}>
          {purchase.status.name}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="备注" span={3}>
        {purchase.remark || '-'}
      </Descriptions.Item>
    </Descriptions>
  </Card>
);

export default BasicInfoCard;
