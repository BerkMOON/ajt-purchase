import type { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';

export interface SubmitSupplierQuoteParams {
  inquiry_no: number | string;
  order_no: number | string;
  items: SubmitSupplierQuoteItemParams[];
}

export interface SubmitSupplierQuoteItemParams {
  sku_id: number | string;
  quantity: number;
  quote_price: number;
  expected_delivery_date: string;
  remark?: string;
}

// OrderQuoteDetailResponse 订单报价响应
export interface OrderQuoteDetailResponse {
  inquiry_no: number | string;
  supplier_id: number;
  supplier_name: string;
  submit_time: string;
  items: OrderQuoteItemResponse[];
}

// OrderQuoteItemResponse 订单报价明细响应
export interface OrderQuoteItemResponse {
  quote_no: number | string;
  sku_id: number;
  sku_name: string;
  quantity: number;
  quote_price: number;
  expected_delivery_date: string;
  remark: string;
  inquiry_item_id?: number;
}

export interface SubmitOrderParams {
  order_no: number | string;
  items: SubmitOrderItemParams[];
}

export interface SubmitOrderItemParams {
  order_item_id: number;
  quote_no: number | string;
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
  status: StatusInfo;
  expected_delivery_date: string;
  remark: string;
  submit_time: string;
  ctime: string;
  mtime: string;
}

export interface GetSupplierQuotesResponse extends BaseListInfo {
  quotes: SupplierQuoteResponse[];
}
