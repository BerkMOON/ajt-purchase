import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  CompanyCreateParams,
  CompanyDeleteParams,
  CompanyList,
  CompanyParams,
  CompanyUpdateParams,
} from './typing';

const API_PREFIX = '/api/v1/platform/company';

export const CompanyAPI = {
  /**
   * 创建公司
   * POST /api/v1/platform/company/create
   * 接口ID：373265153
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373265153
   */
  createCompany: (params?: CompanyCreateParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 公司列表
   * GET /api/v1/platform/company/list
   * 接口ID：373268413
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373268413
   */
  getAllCompanies: (params?: CompanyParams) =>
    request<ResponseInfoType<CompanyList>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),

  /**
   * 更新公司信息
   * POST /api/v1/platform/company/update
   * 接口ID：373265655
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373265655
   */
  updateCompany: (params?: CompanyUpdateParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新公司状态
   * POST /api/v1/platform/company/status
   * 接口ID：373266826
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-373266826
   */
  updateCompanyStatus: (params?: CompanyDeleteParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),
};
