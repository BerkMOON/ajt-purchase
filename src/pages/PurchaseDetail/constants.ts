export const enum OrderStatus {
  DRAFT,
  PENDING_APPROVAL,
  APPROVAL_REJECTED,
  AWAIT_INQUIRY,
  INQUIRING,
  INQUIRY_COMPLETED,
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
  [OrderStatus.INQUIRY_COMPLETED]: {
    code: OrderStatus.INQUIRY_COMPLETED,
    name: '询价完成',
  },
  [OrderStatus.QUOTED]: { code: OrderStatus.QUOTED, name: '已选择报价' },
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
  PENDING_QUOTE,
  SELECTED,
  PENDING_APPROVAL, // 待审批
  REJECTED,
  ORDERED,
  SHIPPED,
  ARRIVED, // 审批不通过
}

export const OrderItemStatusNameMap = {
  [OrderItemStatus.PENDING_QUOTE]: '待报价',
  [OrderItemStatus.SELECTED]: '已选中',
  [OrderItemStatus.PENDING_APPROVAL]: '待审批',
  [OrderItemStatus.REJECTED]: '审批不通过',
  [OrderItemStatus.ORDERED]: '已下单',
  [OrderItemStatus.SHIPPED]: '已发货',
  [OrderItemStatus.ARRIVED]: '已到货',
};

export const OrderItemStatusColorMap = {
  [OrderItemStatus.PENDING_QUOTE]: 'orange',
  [OrderItemStatus.SELECTED]: 'green',
  [OrderItemStatus.PENDING_APPROVAL]: 'blue',
  [OrderItemStatus.REJECTED]: 'red',
  [OrderItemStatus.ORDERED]: 'purple',
  [OrderItemStatus.SHIPPED]: 'purple',
  [OrderItemStatus.ARRIVED]: 'green',
};
