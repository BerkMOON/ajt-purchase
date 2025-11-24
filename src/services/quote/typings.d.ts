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
  inquiry_item_id: number;
  quote_no: string;
}

export interface SelectSuppliersByItemsParams {
  order_no: string;
  selections: SelectSupplierItemParams[];
}

export interface SubmitSupplierQuoteParams {
  inquiry_no: number | string;
  expected_delivery_days: number;
  remark?: string;
  items: SupplierQuoteItemParams[];
}

export interface SupplierQuoteItemParams {
  inquiry_item_id: number;
  quote_price: number;
  expected_delivery_days?: number;
  remark?: string;
}

export interface SupplierQuoteItemResponse {
  inquiry_item_id: number;
  order_item_id?: number;
  sku_id: number;
  product_name: string;
  brand: string;
  quantity: number;
  quote_price: number;
  total_price: number;
  avg_price?: number;
  price_diff_percent?: number;
  expected_delivery_days: number;
  remark: string;
}

export interface SupplierQuoteDetail {
  quote_no: number;
  inquiry_no: number;
  supplier_name: string;
  total_amount: number;
  expected_delivery_days: number;
  remark: string;
  status: StatusInfo;
  submit_user_name: string;
  submit_time: string;
  items: SupplierQuoteItemResponse[];
}

export interface SupplierQuoteSummary {
  quote_no: string;
  inquiry_no: string;
  supplier_name: string;
  status: StatusInfo;
  total_amount: number;
  submit_time: string;
  items: SupplierQuoteItemResponse[];
}

export interface SupplierQuoteListByOrder {
  order_no: string;
  quotes: SupplierQuoteSummary[];
}
