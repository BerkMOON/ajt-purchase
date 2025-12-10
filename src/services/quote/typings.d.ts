import { QuoteStatusTagColor } from '@/services/quote/constant';
import type { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';

export interface SubmitSupplierQuoteParams {
  inquiry_no: number;
  order_no: number;
  sku_id: number;
  quote_price: number;
  expected_delivery_date: string;
  remark: string;
}

export interface SubmitSupplierQuoteItemParams {
  sku_id: number | string;
  quantity: number;
  quote_price: number;
  expected_delivery_date: string;
  remark?: string;
}
export interface GetSupplierQuotesParams extends PageInfoParams {
  quote_no: number | string;
  order_no: number | string;
  status: number;
  ctime_start: string;
  ctime_end: string;
}

export interface SupplierQuoteResponse {
  id: number;
  quote_no: number;
  inquiry_no: number;
  order_no: number;
  sku_id: number;
  sku_name: string;
  quantity: number;
  quote_price: number;
  total_price: number;
  status: StatusInfo<keyof typeof QuoteStatusTagColor>;
  expected_delivery_date: string;
  remark: string;
  submit_time: string;
  ctime: string;
  mtime: string;
}

export interface GetSupplierQuotesResponse extends BaseListInfo {
  quotes: SupplierQuoteResponse[];
}
