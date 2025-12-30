import { InquiryStatus } from '@/services/inquiry/constant';
import type { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';
export interface InquiryDetail {
  id: number;
  inquiry_no: string;
  order_id: number;
  order_no: string;
  supplier_id: number;
  supplier_name: string;
  inquiry_deadline: string;
  status: StatusInfo;
  operator_id: number;
  operator_name: string;
  remark: string;
  no_quote_reason: string;
  create_time: string;
}

export interface SupplierInquiryDetailParams {
  inquiry_no: number | string;
}

export interface InquiryListRequest extends PageInfoParams {
  inquiry_no?: number | string;
  order_no?: number | string;
  status?: number;
  ctime_start?: string;
  ctime_end?: string;
}

export interface SupplierInquiryItem {
  inquiry_no: number;
  order_no: number;
  supplier_id: number;
  supplier_name: string;
  status: StatusInfo<InquiryStatus>;
  deadline: string;
  ctime: string;
  mtime: string;
}

export interface InquiryListResponse extends BaseListInfo {
  inquiries: SupplierInquiryItem[];
}

// InquiryItemResponse 询价单明细响应
export interface InquiryItemResponse {
  sku_id: number;
  sku_name: string;
  quantity: number;
  quote_price: number;
  status: StatusInfo<InquiryStatus>;
  expected_delivery_date: string;
  submit_time: string;
  remark: string;
}

// InquiryDetailResponse 询价单详情响应
export interface InquiryDetailResponse {
  inquiry_no: number;
  order_no: number;
  supplier_id: number;
  supplier_name: string;
  status: StatusInfo;
  deadline: string;
  ctime: string;
  mtime: string;
  expected_delivery_date: string;
  items: InquiryItemResponse[];
}

export interface InquiryQuoteItemResponse {
  sku_id: number;
  sku_name: string;
  quantity: number;
  quote_price: number;
  expected_delivery_date: string;
  status: StatusInfo;
  remark: string;
}

export enum InquiryItemStatus {
  PENDING,
  QUOTED,
  CANCELLED,
}
