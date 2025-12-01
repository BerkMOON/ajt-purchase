import type { StatusInfo } from '@/types/common';

export interface QuoteItemParams {
  inquiry_item_id: number;
  part_id: number;
  quote_price: number;
  brand?: string;
  origin?: string;
  remark?: string;
}

export interface SubmitQuoteParams {
  inquiry_id: number;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  expected_delivery_days: number;
  submit_user_id: number;
  submit_user_name: string;
  remark?: string;
  items: QuoteItemParams[];
}

export interface QuoteDetail {
  id: number;
  quote_no: string;
  inquiry_id: number;
  inquiry_no: string;
  order_id: number;
  order_no: string;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  expected_delivery_days: number;
  quote_status: StatusInfo;
  submit_user_id: number;
  submit_user_name: string;
  submit_time: string;
  remark: string;
  create_time: string;
  items: QuoteItemDetail[];
}

export interface QuoteItemDetail {
  id: number;
  quote_id: number;
  part_id: number;
  part_code: string;
  part_name: string;
  specification: string;
  unit: string;
  quantity: number;
  quote_price: number;
  quote_amount: number;
  historical_avg_price?: number;
  brand?: string;
  origin?: string;
  remark?: string;
}

export interface QuoteComparisonItem {
  supplier_id: number;
  supplier_name: string;
  quote_id: number;
  quote_no: string;
  total_amount: number;
  expected_delivery_days: number;
  submit_time: string;
  items: QuoteItemDetail[];
}

export interface SelectSupplierParams {
  quote_id: number;
  order_no: string;
  selector_id: number;
  selector_name: string;
}

export interface SelectSupplierItemParams {
  inquiry_item_id?: number;
  quote_no: string;
  sku_id?: number | string;
}

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
