export enum InquiryStatus {
  Quoting = 1,
  End,
}

export const InquiryStatusMap = {
  [InquiryStatus.Quoting]: '询价中',
  [InquiryStatus.End]: '询价结束',
};

export const InquiryStatusTagColor = {
  [InquiryStatus.Quoting]: 'orange',
  [InquiryStatus.End]: 'blue',
};
