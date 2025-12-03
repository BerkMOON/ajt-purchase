import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  CategoryParams,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
} from './typing';

const API_PREFIX = '/api/v1/platform/product/category';

export const CategoryAPI = {
  /**
   * 获取下层子节点
   * GET /api/v1/platform/product/category/listChildren
   * 接口ID：382464499
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-382464499
   */
  getChildren: (params: CategoryParams) =>
    request<ResponseInfoType<CategoryResponse>>(`${API_PREFIX}/listChildren`, {
      method: 'GET',
      params,
    }),

  /**
   * 品类节点创建
   * POST /api/v1/platform/product/category/create
   * 接口ID：382454238
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-382454238
   */
  createCategory: (params: CreateCategoryRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 品类节点信息更新
   * POST /api/v1/platform/product/category/update
   * 接口ID：382455316
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-382455316
   */
  updateCategory: (params: UpdateCategoryRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 品类节点状态更新
   * POST /api/v1/platform/product/category/status
   * 接口ID：382456906
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-382456906
   */
  updateCategoryStatus: (params: UpdateCategoryStatusRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 品类节点删除
   * POST /api/v1/platform/product/category/delete
   * 接口ID：382458801
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-382458801
   */
  deleteCategory: (id: number) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/delete`, {
      method: 'POST',
      data: {
        category_id: id,
      },
    }),
};
