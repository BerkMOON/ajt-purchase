import { COMMON_CATEGORY_STATUS } from '@/constants';

export interface GetSkuListByProductParams {
  product_id: number;
}

export interface SkuListInfo {
  attr_pairs?: AttrPair[];
  sku_id?: number;
  sku_name?: string;
  status?: StatusInfo;
}

export interface SkuListResponse {
  sku_list: SkuListInfo[];
}

export interface AttrPair {
  attr_code?: string;
  attr_name?: string;
  value_code?: string;
  value_name?: string;
}

export interface CreateSkuParams {
  attr_pairs: AttrPair[];
  photos?: string[];
  product_id: number;
  remark?: string;
  sku_name: string;
  specification?: string;
}

export interface UpdateSkuParams {
  photos?: string[];
  remark?: string;
  sku_id: number;
  sku_name?: string;
  specification?: string;
}

export interface SkuDetailResponse {
  attr_pairs?: AttrPair[];
  create_time?: string;
  modify_time?: string;
  photos?: {
    path?: string;
    url?: string;
  }[];
  product_id?: number;
  remark?: string;
  sku_id?: number;
  sku_name?: string;
  specification?: string;
  status?: StatusInfo;
}

export interface UpdateSkuStatusParams {
  sku_id: number;
  status: COMMON_CATEGORY_STATUS;
}
