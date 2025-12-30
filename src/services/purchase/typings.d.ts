import { COMMON_STATUS_CODE } from '@/constants';
import { OrderItemStatus } from '@/pages/PurchaseDetail/constants';
import { PurchaseStatusColorMap } from '@/pages/PurchaseDetail/utils';
import { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';
export interface PurchaseItem {
  id: number;
  order_no: string;
  store_id: number;
  store_name: string;
  creator_id: number;
  creator_name: string;
  expected_delivery_date: string;
  inquiry_deadline?: string;
  status: StatusInfo<keyof typeof PurchaseStatusColorMap>;
  order_type?: number;
  remark?: string;
  ctime: string;
  mtime: string;
}

// 商品类型枚举
export enum CategoryType {
  PARTS = 'parts', // 备件
  // 【已删除】ACCESSORIES - 暂不支持精品模块
}

// 库存状态枚举
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export interface PurchaseParams {
  page?: number;
  limit?: number;
  order_no?: string;
  ctime_start?: string;
  ctime_end?: string;
  store_id?: string;
  status?: string;
}

export interface CreatePurchaseParams {
  expected_delivery_date: string;
  inquiry_deadline?: string;
  remark?: string;
  order_type?: number;
  items: CreatePurchaseItemParams[];
}

export interface CreatePurchaseItemParams {
  sku_id: number;
  quantity: number;
  remark?: string;
}

export interface PurchaseListResponse extends BaseListInfo {
  orders: PurchaseItem[];
}

export interface DraftListResponse {
  drafts: PurchaseDraftItem[];
}

export interface PurchaseDraftItem {
  store_id: number;
  store_name: string;
  creator_id: number;
  creator_name: string;
  expected_delivery_date: string;
  inquiry_deadline?: string;
  remark?: string;
  status: StatusInfo<keyof typeof PurchaseStatusColorMap>;
  order_type?: number;
  ctime: number;
  mtime: number;
  items: CreatePurchaseItemParams[];
}

// 配件目录相关类型
export interface PartCategory {
  id: string;
  name: string;
  parent_id?: string;
  category_type: CategoryType;
  path: string;
  level: number;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PartCatalogParams {
  page?: number;
  page_size?: number;
  category_type?: CategoryType;
  category_id?: string;
  keyword?: string;
  supplier_id?: string;
  stock_status?: StockStatus;
}

export interface PageInfo_PartCatalog {
  meta: {
    total_count: number;
    total_page: number;
  };
  part_list: (PartsInfo | AccessoryInfo)[];
}
export interface PurchaseOrderItemResponse {
  id: number;
  sku_id: number;
  sku_name: string;
  quantity: number;
  status: StatusInfo<OrderItemStatus>;
  delivery_date: string;
  supplier_id: number;
  supplier_name: string;
  quote_price: number;
  total_price: number;
  quote_remark: string;
  quote_delivery_date: string;
  quote_no: number;
  purchase_type: string;
  remark: string;
  ctime: string;
  mtime: string;
  limit_price: number;
}

// PurchaseOrderDetailResponse 采购单详情响应
export interface PurchaseOrderDetailResponse {
  id: number;
  order_no: number;
  store_id: number;
  store_name: string;
  creator_id: number;
  creator_name: string;
  expected_delivery_date: string;
  inquiry_deadline: string;
  remark: string;
  status: StatusInfo<keyof typeof PurchaseStatusColorMap>;
  order_type: number;
  items: PurchaseOrderItemResponse[];
  ctime: string;
  mtime: string;
}

export interface BasicPurchaseOrderStatusLog {
  from_status: StatusInfo<keyof typeof PurchaseStatusColorMap>;
  to_status: StatusInfo<keyof typeof PurchaseStatusColorMap>;
  operator_id: number;
  operator_name: string;
  remark: string;
  ctime: string;
}
export interface PurchaseOrderStatusLog extends BasicPurchaseOrderStatusLog {
  id: number;
  order_id: number;
  order_no: number;
}

export interface PurchaseOrderStatusLogItem
  extends BasicPurchaseOrderStatusLog {
  quote_no: number;
}

export interface PurchaseOrderItemStatusLog {
  sku_id: number;
  status_logs: PurchaseOrderStatusLogItem[];
}

export interface PurchaseOrderStatusLogResponse {
  logs: PurchaseOrderItemStatusLog[];
  order_logs: PurchaseOrderStatusLog[];
}

export interface SendSupplierInquiryParams {
  order_no: number;
  deadline: string;
}

// OrderQuoteDetailResponse 订单报价响应
export interface OrderQuoteDetailResponse {
  sku_list: SkuList[];
}

export interface SkuList {
  quantity: number;
  quote_items: QuoteItem[];
  sku_id: number;
  sku_name: string;
  third_code: string;
  limit_price: number;
}

export interface QuoteItem {
  expected_delivery_date: string;
  inquiry_no: number;
  quote_no: number;
  quote_price: number | number;
  remark: string;
  submit_time: string;
  supplier_id: number;
  supplier_name: string;
  tracking_info?: {
    tracking_no_list: string[];
    remark: string;
  };
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
  inquiry_no: number;
  order_no: number;
  quote_no: number;
  sku_id: number;
}

export interface ConfirmOrderParams {
  order_no: number;
  sku_id_list: number[];
}
export interface SubmitOrderItemParams {
  sku_id: number;
  quote_no: number | string;
}

export interface ConfirmArrivalParams {
  order_no: number;
  items: ConfirmArrivalItemParams[];
}

export interface ConfirmArrivalItemParams {
  sku_id: number;
  quote_no: number | string;
  delivery_date: string;
}

export interface GetSkuListParams extends PageInfoParams {
  brand_id?: number;
  product_id?: number;
  /**
   * parts，boutique
   */
  product_type?: string;
  sku_id?: number;
  sku_name?: string;
  /**
   * active，disabled
   */
  status?: string;
  third_code?: string;
}

export interface SkuInfoResponse extends BaseListInfo {
  sku_list: SkuListInfo[];
}

export interface SkuListInfo {
  attr_pairs?: string;
  brand_name?: string;
  create_time?: string;
  modify_time?: string;
  price_info?: {
    origin_price?: number;
    ceiling_price?: number;
    return_purchase_price?: number;
  };
  product_id?: number;
  product_type?: string;
  sku_id?: number;
  sku_name?: string;
  status?: StatusInfo<COMMON_STATUS_CODE>;
  third_code?: string;
}
