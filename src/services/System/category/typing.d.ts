import { COMMON_CATEGORY_STATUS } from '@/constants';
import { StatusInfo } from '@/types/common';

export interface CategoryParams {
  parent_id: number;
  status?: COMMON_CATEGORY_STATUS;
}

export interface CategoryInfo {
  create_time?: string;
  id?: number;
  level?: string;
  modify_time?: string;
  name?: string;
  parent_id?: string;
  status?: StatusInfo;
  has_children?: boolean;
}

export interface CategoryResponse {
  categories: CategoryInfo[];
}

export interface CreateCategoryRequest {
  name: string;
  parent_id: number;
}

export interface UpdateCategoryRequest {
  category_id: number;
  name: string;
}

export interface UpdateCategoryStatusRequest {
  category_id: number;
  status: COMMON_CATEGORY_STATUS;
}
