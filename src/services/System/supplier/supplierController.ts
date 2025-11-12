import { COMMON_STATUS } from '@/constants';
import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  CreateSupplierRequest,
  SupplierInfo,
  SupplierListRequest,
  SupplierListResponse,
} from './typings';

const API_PREFIX = '/api/v1/platform/supplier';

export const SupplierAPI = {
  /**
   * 创建供应商
   * POST /api/v1/platform/supplier/create
   * 接口ID：373373496
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373373496
   */
  createSupplier: (params: CreateSupplierRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新供应商信息
   * POST /api/v1/platform/supplier/update
   * 接口ID：373378246
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373378246
   */
  updateSupplier: (params: CreateSupplierRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新供应商状态
   * POST /api/v1/platform/supplier/status
   * 接口ID：373382038
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373382038
   */
  updateSupplierStatus: (params: {
    supplier_id: string;
    status: COMMON_STATUS;
  }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 单个供应商详情
   * GET /api/v1/platform/supplier/detail
   * 接口ID：373383385
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373383385
   */
  getSupplierDetail: (params: { supplier_id: string }) =>
    request<ResponseInfoType<SupplierInfo>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params,
    }),

  /**
   * 供应商列表
   * GET /api/v1/platform/supplier/list
   * 接口ID：373385634
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373385634
   */
  getSupplierList: (params: SupplierListRequest) =>
    request<ResponseInfoType<SupplierListResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),
};
