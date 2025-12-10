export enum InquiryStatus {
  Quoting = 1,
  End,
}

export const InquiryStatusMap = {
  [InquiryStatus.Quoting]: '询价中',
  [InquiryStatus.End]: '已结束',
};

export const InquiryStatusTagColor = {
  [InquiryStatus.Quoting]: 'warning',
  [InquiryStatus.End]: 'blue',
};
