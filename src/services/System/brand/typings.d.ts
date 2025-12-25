import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';

export interface CreateBrandParams {
  brand_name: string;
  remark?: string;
}

export interface UpdateBrandParams {
  brand_id: number;
  brand_name?: string;
  remark?: string;
}

export interface BrandDetailResponse {
  brand_name?: string;
  create_time?: string;
  id?: number;
  modify_time?: string;
  remark?: string;
  status?: StatusInfo<COMMON_STATUS_CODE>;
}

export interface GetBrandListParams extends PageInfoParams {
  brand_name?: string;
  status?: COMMON_STATUS;
}

export interface BrandListResponse extends BaseListInfo {
  brands: BrandDetailResponse[];
}
