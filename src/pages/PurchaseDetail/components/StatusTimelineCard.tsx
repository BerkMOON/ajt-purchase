import type { PurchaseOrderDetailResponse } from '@/services/purchase/typings.d';
import { Card, Timeline } from 'antd';
import React from 'react';
import { OrderStatus } from '../constants';

interface StatusTimelineCardProps {
  purchase: PurchaseOrderDetailResponse;
}

const StatusTimelineCard: React.FC<StatusTimelineCardProps> = ({
  purchase,
}) => (
  <Card title="状态流水" size="small">
    <Timeline>
      <Timeline.Item color="green">
        <p>
          <strong>创建采购单</strong>
        </p>
        <p style={{ color: '#666' }}>
          {purchase.creator_name} 于 {purchase.ctime}
        </p>
      </Timeline.Item>

      {/* {purchase.status.code >= OrderStatus.PENDING_APPROVAL ? (
        <Timeline.Item color="processing">
          <p>
            <strong>待审核</strong>
          </p>
          <p style={{ color: '#666' }}>采购单已提交审核（第一版自动审核）</p>
        </Timeline.Item>
      ) : (
        <Timeline.Item color="processing">
          <p>
            <strong>已审核</strong>
          </p>
          <p style={{ color: '#666' }}>采购单已提交审核（第一版自动审核）</p>
        </Timeline.Item>
      )} */}

      {purchase.status.code >= OrderStatus.INQUIRING && (
        <Timeline.Item color="orange">
          <p>
            <strong>发起询价</strong>
          </p>
          <p style={{ color: '#666' }}>
            系统已自动向能提供此商品的供应商发送询价通知
          </p>
        </Timeline.Item>
      )}
      {purchase.status.code >= OrderStatus.QUOTED && (
        <Timeline.Item color="purple">
          <p>
            <strong>已选择报价</strong>
          </p>
          <p style={{ color: '#666' }}>
            采购员已确认选择某个供应商的报价，进入价格审批或下单流程
          </p>
        </Timeline.Item>
      )}
      {purchase.status.code >= OrderStatus.PRICE_PENDING_APPROVAL && (
        <Timeline.Item color="cyan">
          <p>
            <strong>价格审批中</strong>
          </p>
          <p style={{ color: '#666' }}>
            已选择供应商，价格审批中（超过均价需审批）
          </p>
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
);

export default StatusTimelineCard;
