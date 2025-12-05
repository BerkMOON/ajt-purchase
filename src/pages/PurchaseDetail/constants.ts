export const enum OrderStatus {
  DRAFT,
  PENDING_APPROVAL,
  APPROVAL_REJECTED,
  AWAIT_INQUIRY,
  INQUIRING,
  QUOTED,
  PRICE_PENDING_APPROVAL,
  PRICE_APPROVAL_REJECTED,
  ORDERED,
  ARRIVED,
}

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
  [OrderStatus.AWAIT_INQUIRY]: {
    code: OrderStatus.AWAIT_INQUIRY,
    name: '待询价',
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
