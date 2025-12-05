import { BaseListInfo, StatusInfo } from '@/types/common';
export interface PurchaseItem {
  id: number;
  order_no: string;
  store_id: number;
  store_name: string;
  creator_id: number;
  creator_name: string;
  expected_delivery_date: string;
  inquiry_deadline?: string;
  status: PurchaseStatus;
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
  status: PurchaseStatus;
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
  status: StatusInfo;
  delivery_date: string;
  supplier_id: number;
  supplier_name: string;
  quote_price: number;
  total_price: number;
  quote_remark: string;
  quote_delivery_date: string;
  quote_no: number;
  remark: string;
  ctime: string;
  mtime: string;
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
  status: StatusInfo;
  order_type: number;
  items: PurchaseOrderItemResponse[];
  ctime: string;
  mtime: string;
}

export interface PurchaseOrderStatusLogResponse {
  id: number;
  order_id: number;
  order_no: number;
  from_status: StatusInfo;
  to_status: StatusInfo;
  operator_id: number;
  operator_name: string;
  remark: string;
  ctime: string;
}

export interface SendSupplierInquiryParams {
  order_no: number;
  deadline: string;
}
