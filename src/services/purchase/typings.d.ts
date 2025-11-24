import { BaseListInfo } from '@/types/common';
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
  items?: PurchaseDetailItem[];
}

export interface PurchaseStatus {
  code: number;
  name: string;
}

// 商品类型枚举
export enum CategoryType {
  PARTS = 1, // 备件
  // 【已删除】ACCESSORIES - 暂不支持精品模块
}

// 库存状态枚举
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

// 通用配件信息
export interface BasePartInfo {
  part_id: string;
  part_code: string;
  part_name: string;
  category_type: CategoryType;
  category_path: string;
  specification: string;
  unit: string;
  description?: string;
  brand?: string;
  create_time: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 备件专用信息
export interface PartsInfo extends BasePartInfo {
  category_type: CategoryType.PARTS;
  oem_number?: string;
  applicable_models: string[];
  historical_avg_price?: number;
  min_suppliers: number;
  price_validity_days: number;
}

// 精品专用信息
export interface AccessoryInfo extends BasePartInfo {
  category_type: CategoryType.ACCESSORIES;
  supplier_id: string;
  supplier_name: string;
  supplier_part_code: string;
  fixed_price: number;
  price_update_time: string;
  min_order_quantity: number;
  stock_status: StockStatus;
}

export interface PurchaseDetailItem {
  id?: number;
  sku_id: string;
  product_name: string;
  brand: string;
  category_id?: number;
  category_name?: string;
  quantity: number;
  avg_price?: number;
  selected_supplier_id?: number;
  selected_supplier_name?: string;
  actual_price?: number;
  actual_total_price?: number;
  remark?: string;
}

export interface PurchaseParams {
  page?: number;
  limit?: number;
  order_no?: string;
  start_date?: string;
  end_date?: string;
  store_ids?: string;
  statuses?: string;
  date_range?: any; // 用于前端表单的日期范围选择器
}

export interface CreatePurchaseParams {
  store_id: number;
  expected_delivery_date: string;
  inquiry_deadline?: string;
  remark?: string;
  order_type?: number;
  items: CreatePurchaseItemParams[];
}

export interface CreatePurchaseItemParams {
  sku_id: string;
  product_name: string;
  brand: string;
  category_id?: number;
  category_name?: string;
  quantity: number;
  avg_price?: number;
  remark?: string;
}

export type UpdatePurchaseParams = CreatePurchaseParams;

export interface PageInfo_PurchaseItem extends BaseListInfo {
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
  item_count: number;
  ctime: number;
  mtime: number;
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

export const PurchaseStatusMap = {
  0: { code: 0, name: '草稿' },
  1: { code: 1, name: '待审核' },
  2: { code: 2, name: '审核驳回' },
  3: { code: 3, name: '询价中' },
  4: { code: 4, name: '已报价' },
  5: { code: 5, name: '价格待审批' },
  6: { code: 6, name: '价格审批驳回' },
  7: { code: 7, name: '已下单' },
  8: { code: 8, name: '已到货' },
};
