export enum QuoteStatus {
  NOT_SELECTED,
  SELECTED,
  PENDING_SHIPMENT,
}

export const QuoteStatusMap = {
  [QuoteStatus.NOT_SELECTED]: '未选中',
  [QuoteStatus.SELECTED]: '已选中',
  [QuoteStatus.PENDING_SHIPMENT]: '待发货',
};

export const QuoteStatusTagColor = {
  [QuoteStatus.NOT_SELECTED]: 'red',
  [QuoteStatus.SELECTED]: 'success',
  [QuoteStatus.PENDING_SHIPMENT]: 'blue',
};
