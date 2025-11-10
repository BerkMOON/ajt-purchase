export interface PurchaseItem {
  id: string;
  purchase_no: string;
  create_time: string;
  modify_time: string;
  store_name: string;
  creator_name: string;
  total_amount: number;
  status: PurchaseStatus;
  expected_delivery_date: string;
  remark?: string;
  purchase_details: PurchaseDetailItem[];
  // 到货相关字段
  arrival_date?: string; // 实际到货日期
  arrival_confirm_time?: string; // 到货确认时间
  delivery_cycle?: number; // 交货周期（天）
}

export interface PurchaseStatus {
  code: number;
  name: string;
}

// 商品类型枚举
export enum CategoryType {
  PARTS = 'PARTS', // 备件
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
  id: string;
  part_code: string;
  part_name: string;
  specification: string;
  quantity: number;
  unit: string;
  category_type: CategoryType;
  historical_avg_price?: number;
  // 精品专用字段
  supplier_id?: string;
  supplier_name?: string;
  fixed_price?: number;
  stock_status?: StockStatus;
}

export interface PurchaseParams {
  page?: number;
  page_size?: number;
  purchase_no?: string;
  start_date?: string;
  end_date?: string;
  store_ids?: string[];
  creator_name?: string;
  status_codes?: number[];
  exclude_status?: number; // 排除指定状态的采购单
  date_range?: any; // 用于前端表单的日期范围选择器
}

export interface CreatePurchaseParams {
  expected_delivery_date: string;
  remark?: string;
  purchase_details: Omit<PurchaseDetailItem, 'id' | 'historical_avg_price'>[];
}

export interface UpdatePurchaseParams extends CreatePurchaseParams {
  purchase_id: string;
}

export interface PageInfo_PurchaseItem {
  meta: {
    total_count: number;
    total_page: number;
  };
  purchase_list: PurchaseItem[];
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
  1: { code: 1, name: '草稿' },
  2: { code: 2, name: '待询价' },
  3: { code: 3, name: '已报价' },
  4: { code: 4, name: '价格待审批' },
  5: { code: 5, name: '已下单' },
  6: { code: 6, name: '已到货' },
};
