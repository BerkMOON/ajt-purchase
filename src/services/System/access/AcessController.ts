import { Role } from '@/constants';
import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { ApiAccessResponse } from './typings';

const API_PREFIX = '/api/v1/platform/apis';

export const AccessAPI = {
  /**
   *接口模块列表
   *GET /api/v1/platform/apis/module/list
   *接口ID：374993903
   *接口地址：https://app.apifox.com/link/project/7357392/apis/api-374993903
   */
  getModuleList: () =>
    request<
      ResponseInfoType<{
        module_list?: {
          code: string;
          name: string;
        }[];
      }>
    >(`${API_PREFIX}/module/list`, {
      method: 'GET',
    }),

  /**
   *接口层级列表
   *GET /api/v1/platform/apis/level/list
   *接口ID：374995330
   *接口地址：https://app.apifox.com/link/project/7357392/apis/api-374995330
   */
  getLevelList: (params?: Role) =>
    request<
      ResponseInfoType<{
        level_list?: {
          code: string;
          name: string;
        }[];
      }>
    >(`${API_PREFIX}/level/list`, {
      method: 'GET',
      params,
    }),

  /**
   *接口列表
   *GET /api/v1/platform/apis/list
   *接口ID：374997415
   *接口地址：https://app.apifox.com/link/project/7357392/apis/api-374997415
   */
  getApiList: (params?: { module?: Role }) =>
    request<ResponseInfoType<ApiAccessResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),

  /**
   *创建接口
   *POST /api/v1/platform/apis/create
   *接口ID：374998305
   *接口地址：https://app.apifox.com/link/project/7357392/apis/api-374998305
   */
  createApi: (params?: any) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   *修改接口状态
   *POST /api/v1/platform/apis/status
   *接口ID：374999055
   *接口地址：https://app.apifox.com/link/project/7357392/apis/api-374999055
   */
  updateApiStatus: (params?: any) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),
};
