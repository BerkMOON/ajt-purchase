import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  StoreCreateParams,
  StoreDeleteParams,
  StoreList,
  StoreParams,
  StoreUpdateParams,
} from './typing';

const API_PREFIX = '/api/v1/platform/store';

export const StoreAPI = {
  /**
   * 创建门店
   * POST /api/v1/platform/store/create
   * 接口ID：373273725
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373273725
   */
  createStore: (params?: StoreCreateParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 门店列表
   * GET /api/v1/platform/store/list
   * 接口ID：373279871
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373279871
   */
  getAllStores: (params?: StoreParams) =>
    request<ResponseInfoType<StoreList>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),

  /**
   * 更新门店信息
   * POST /api/v1/platform/store/update
   * 接口ID：373275510
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373275510
   */
  updateStore: (params?: StoreUpdateParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新门店状态
   * POST /api/v1/platform/store/status
   * 接口ID：373276692
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373276692
   */
  updateStoreStatus: (params?: StoreDeleteParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),
};
