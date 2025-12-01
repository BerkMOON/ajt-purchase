import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  GetSkuDetailParams,
  SkuDetailResponse,
  SkuListResponse,
} from './typings';

const API_PREFIX = '/api/v1/mock/sku';

export const SkuAPI = {
  /**
   * 获取SKU列表
   * GET /api/v1/sku/list
   */
  getSkuList: () =>
    request<ResponseInfoType<SkuListResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
    }),

  /**
   * 根据SKU ID查询SKU信息
   * GET /api/v1/sku/detail
   */
  getSkuDetail: (params: GetSkuDetailParams) =>
    request<ResponseInfoType<SkuDetailResponse>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: {
        sku_id: params.sku_id,
      },
    }),
};
