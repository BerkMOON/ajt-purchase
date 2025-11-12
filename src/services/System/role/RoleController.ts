import { COMMON_STATUS } from '@/constants';
import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  CreateRoleRequest,
  RoleListRequest,
  RoleListResponse,
} from './typings';

const API_PREFIX = '/api/v1/platform/role';

export const RoleAPI = {
  /**
   * 角色列表
   * GET /api/v1/platform/role/list
   * 接口ID：372517018
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372517018
   */
  getRoleList: (params: RoleListRequest) =>
    request<ResponseInfoType<RoleListResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),

  /**
   * 创建角色
   * POST /api/v1/platform/role/create
   * 接口ID：372513629
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372513629
   */
  createRole: (params: CreateRoleRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新角色信息
  POST /api/v1/platform/role/update
  接口ID：372516008
  接口地址：https://app.apifox.com/link/project/7357392/apis/api-372516008
   */
  updateRole: (params: CreateRoleRequest) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新角色状态
   * POST /api/v1/platform/role/status
   * 接口ID：372516270
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372516270
   */
  updateRoleStatus: (params: { role_id: string; status: COMMON_STATUS }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 绑定接口
   * POST /api/v1/platform/role/bindApis
   * 接口ID：375007169
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-375007169
   */
  bindApis: (params: { role_id: number; api_codes: string[] }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/bindApis`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 角色接口列表
   * GET /api/v1/platform/role/listRoleApis
   * 接口ID：375007999
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-375007999
   */
  listRoleApis: (params: { role_id: string }) =>
    request<
      ResponseInfoType<{
        code_list?: string[];
      }>
    >(`${API_PREFIX}/listRoleApis`, {
      method: 'GET',
      params,
    }),
};
