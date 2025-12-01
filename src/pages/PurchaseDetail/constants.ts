export const OrderStatus = {
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  APPROVAL_REJECTED: 2,
  INQUIRING: 3,
  QUOTED: 4,
  PRICE_PENDING_APPROVAL: 5,
  PRICE_APPROVAL_REJECTED: 6,
  ORDERED: 7,
  ARRIVED: 8,
} as const;

export type OrderStatusEnum = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PurchaseStatusMap = {
  [OrderStatus.DRAFT]: { code: OrderStatus.DRAFT, name: '草稿' },
  [OrderStatus.PENDING_APPROVAL]: {
    code: OrderStatus.PENDING_APPROVAL,
    name: '待审核',
  },
  [OrderStatus.APPROVAL_REJECTED]: {
    code: OrderStatus.APPROVAL_REJECTED,
    name: '审核驳回',
  },
  [OrderStatus.INQUIRING]: { code: OrderStatus.INQUIRING, name: '询价中' },
  [OrderStatus.QUOTED]: { code: OrderStatus.QUOTED, name: '已报价' },
  [OrderStatus.PRICE_PENDING_APPROVAL]: {
    code: OrderStatus.PRICE_PENDING_APPROVAL,
    name: '价格待审批',
  },
  [OrderStatus.PRICE_APPROVAL_REJECTED]: {
    code: OrderStatus.PRICE_APPROVAL_REJECTED,
    name: '价格审批驳回',
  },
  [OrderStatus.ORDERED]: { code: OrderStatus.ORDERED, name: '已下单' },
  [OrderStatus.ARRIVED]: { code: OrderStatus.ARRIVED, name: '已到货' },
};

export enum OrderItemStatus {
  PENDING_QUOTE = 1,
  SELECTED = 2,
  ORDERED = 3,
  ARRIVED = 4,
}

export const OrderItemStatusNameMap = {
  [OrderItemStatus.PENDING_QUOTE]: '待报价',
  [OrderItemStatus.SELECTED]: '已选中',
  [OrderItemStatus.ORDERED]: '已下单',
  [OrderItemStatus.ARRIVED]: '已到货',
};
