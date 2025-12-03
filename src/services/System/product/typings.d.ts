import { COMMON_CATEGORY_STATUS } from '@/constants';
import { PageInfoParams, StatusInfo } from '@/types/common';

export enum CategoryType {
  PARTS = 'parts', // 备件
  // 【已删除】ACCESSORIES - 暂不支持精品模块
}

export interface ProductParams {
  category_id: number;
  name: string;
  photos?: string[];
  /**
   * parts备品
   */
  product_type: CategoryType;
  remark?: string;
  specification?: string;
}

export interface ProductResponse {
  product_id: number;
}

export interface UpdateProductParams {
  category_id?: number;
  name?: string;
  photos?: string[];
  product_id: number;
  remark?: string;
  specification?: string;
}

export interface UpdateProductStatusParams {
  product_id: number;
  status: COMMON_CATEGORY_STATUS;
}

export interface CategoryTree {
  id?: number;
  level?: number;
  name?: string;
  parent_id?: number;
  status?: StatusInfo;
}

export interface Photo {
  path?: string;
  url?: string;
}

export interface ProductDetailResponse {
  category_tree?: CategoryTree[];
  create_time?: string;
  modify_time?: string;
  name?: string;
  photos?: Photo[];
  product_id?: number;
  product_type?: string;
  remark?: string;
  specification?: string;
  status?: StatusInfo;
}

export interface GetProductListParams extends PageInfoParams {
  category_id?: number;
  name?: string;
  product_id?: number;
  product_type?: string;
  status?: string;
}

export interface ProductInfo {
  create_time?: string;
  modify_time?: string;
  name?: string;
  product_id?: number;
  product_type?: string;
  status?: StatusInfo;
}

export interface ProductListResponse extends BaseListInfo {
  product_list?: ProductInfo[];
}
