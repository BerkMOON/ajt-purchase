import { COMMON_STATUS } from '@/constants';
import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  BrandDetailResponse,
  BrandListResponse,
  CreateBrandParams,
  GetBrandListParams,
  UpdateBrandParams,
} from './typings';

const API_PREFIX = '/api/v1/platform/brand';

export const BrandAPI = {
  /**
   * 创建品牌
   * POST /api/v1/platform/brand/create
   * 接口ID：395063177
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-395063177
   */
  create: (params: CreateBrandParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新品牌信息
   * POST /api/v1/platform/brand/update
   * 接口ID：395066466
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-395066466
   */
  update: (params: UpdateBrandParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新品牌状态
   * POST /api/v1/platform/brand/status
   * 接口ID：395068316
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-395068316
   */
  updateStatus: (brand_id: number, status: COMMON_STATUS) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: { brand_id, status },
    }),

  /**
   * 查询品牌详情
   * GET /api/v1/platform/brand/detail
   * 接口ID：395072387
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-395072387
   */
  getDetail: (brand_id: number) =>
    request<ResponseInfoType<BrandDetailResponse>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { brand_id },
    }),

  /**
   * 品牌列表
   * GET /api/v1/platform/brand/list
   * 接口ID：395077977
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-395077977
   */
  getList: (params: GetBrandListParams) =>
    request<ResponseInfoType<BrandListResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),
};
