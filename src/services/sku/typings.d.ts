/**
 * SKU信息
 */
export interface SkuInfo {
  /** SKU ID */
  sku_id: number;
  /** SKU名称 */
  sku_name: string;
  /** 平均价格 */
  avg_price: number;
}

/**
 * SKU列表响应
 */
export interface SkuListResponse {
  /** SKU列表 */
  list: SkuInfo[];
  /** 总数 */
  count: number;
}

/**
 * SKU详情响应
 */
export interface SkuDetailResponse {
  /** SKU信息 */
  sku_info: SkuInfo;
}

/**
 * 获取SKU详情参数
 */
export interface GetSkuDetailParams {
  /** SKU ID */
  sku_id: number;
}
