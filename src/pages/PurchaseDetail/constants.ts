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
