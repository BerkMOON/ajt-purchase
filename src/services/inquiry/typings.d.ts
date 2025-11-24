import type { SupplierQuoteDetail } from '@/services/quote/typings';
import type { StatusInfo } from '@/types/common';

export interface SendInquiryParams {
  order_id: number;
  order_no: string;
  supplier_ids: number[];
  inquiry_deadline: string;
  operator_id: number;
  operator_name: string;
  remark?: string;
}

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

export interface SupplierInquiryItem {
  inquiry_no: string;
  order_no: string;
  supplier_name: string;
  deadline: string;
  status: StatusInfo;
  item_count: number;
  created_at: string;
}

export interface SupplierInquiryDetail {
  inquiry_no: string;
  order_no: string;
  order_id: number;
  supplier_id: number;
  supplier_name: string;
  deadline: string;
  status: StatusInfo;
  item_count: number;
  created_at: string;
  items: SupplierInquiryDetailItem[];
  quote?: SupplierQuoteDetail;
}

export interface SupplierInquiryDetailItem {
  inquiry_item_id: number;
  order_item_id: number;
  sku_id: number;
  product_name: string;
  brand: string;
  quantity: number;
  avg_price?: number;
}

export interface SupplierInquiryListParams {
  page?: number;
  limit?: number;
  status?: number;
  supplier_code?: string;
  inquiry_no?: string; // 询价单号
  order_no?: string; // 采购单号
  start_date?: string; // 开始日期（格式：YYYY-MM-DD）
  end_date?: string; // 结束日期（格式：YYYY-MM-DD）
}

export interface SupplierInquiryDetailParams {
  inquiry_no: number | string;
  supplier_code?: string;
}

export interface SubmitNoQuoteReasonParams {
  inquiry_id: number;
  supplier_id: number;
  reason: string;
}
