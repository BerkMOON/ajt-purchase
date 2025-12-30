export enum QuoteStatus {
  NOT_SELECTED, // 未选择
  SELECTED, // 已选中                            // 待审批
  PENDING_SHIPMENT, // 待发货
  SHIPMENT, // 已发货
  COMPLETED, // 已到货
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
