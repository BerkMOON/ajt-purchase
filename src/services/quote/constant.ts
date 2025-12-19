export enum QuoteStatus {
  NOT_SELECTED,
  SELECTED,
  PENDING_SHIPMENT,
  SHIPMENT,
  COMPLETED,
}

export const QuoteStatusMap = {
  [QuoteStatus.NOT_SELECTED]: '未选中',
  [QuoteStatus.SELECTED]: '已选中',
  [QuoteStatus.PENDING_SHIPMENT]: '待发货',
  [QuoteStatus.SHIPMENT]: '已发货',
  [QuoteStatus.COMPLETED]: '已到货',
};

export const QuoteStatusTagColor = {
  [QuoteStatus.NOT_SELECTED]: 'red',
  [QuoteStatus.SELECTED]: 'green',
  [QuoteStatus.PENDING_SHIPMENT]: 'blue',
  [QuoteStatus.SHIPMENT]: 'purple',
  [QuoteStatus.COMPLETED]: 'green',
};
