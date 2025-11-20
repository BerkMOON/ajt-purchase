/* eslint-disable */
import { COMMON_STATUS } from '@/constants';
import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import type {
  CaptchaRequest,
  CaptchaResponse,
  CreateUserParams,
  LoginResponse,
  QueryUserListParams,
  QueryUserListResponse,
  UserInfo,
  UserRoleResponse,
  UserStoreInfo,
} from './typings';

const API_PREFIX = '/api/v1/platform/user';

export const UserAPI = {
  /**
   * 用户列表
   * GET /api/v1/platform/user/list
   * 接口ID：372130720
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372130720
   */
  queryUserList: (params?: QueryUserListParams) =>
    request<ResponseInfoType<QueryUserListResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    }),

  /**
   * 获取登录用户信息
   * GET /api/v1/getSelfInfo
   * 接口ID：372021960
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372021960
   */
  getUserDetail: () =>
    request<ResponseInfoType<UserInfo>>('/api/v1/getSelfInfo', {
      method: 'GET',
    }),

  /**
   * 用户登录
   * POST /api/login
   */
  loginUser: (params: {
    username: string;
    password: string;
    captcha_id: string;
    answer: string;
  }) =>
    request<ResponseInfoType<LoginResponse>>('/api/v1/login', {
      method: 'POST',
      data: params,
    }),

  /**
   * 重置用户密码
   * POST /api/v1/platform/user/password/reset
   * 接口ID：372129897
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372129897
   */
  resetUserPassword: (params: { user_id: string; password: string }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/password/reset`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 创建用户
   * POST /api/v1/platform/user/create
   * 接口ID：372026063
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372026063
   */
  createUser: (params: CreateUserParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新用户状态
   * POST /api/v1/platform/user/status
   * 接口ID：372129195
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372129195
   */
  updateUserStatus: (params: { user_id: string; status: COMMON_STATUS }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新用户信息
   * POST /api/v1/platform/user/update
   * 接口ID：372128245
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372128245
   */
  modifyUserInfo: (params: UserInfo) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 获取验证码
   * POST /api/v1/captcha/gen
   * 接口ID：372032368
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372032368
   */
  generateCaptcha: (params: CaptchaRequest) =>
    request<ResponseInfoType<CaptchaResponse>>('/api/v1/captcha/gen', {
      method: 'POST',
      data: params,
    }),

  /**
   * 绑定用户角色
   * POST /api/v1/platform/user/bindRole
   * 接口ID：372519434
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372519434
   */
  bindUserRole: (params: { user_id: number; role_id: number }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/bindRole`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 获取用户角色
   * GET /api/v1/platform/user/listUserRole
   * 接口ID：372520262
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-372520262
   */
  getUserRole: (params: { user_id: number }) =>
    request<ResponseInfoType<UserRoleResponse>>(`${API_PREFIX}/listUserRole`, {
      method: 'GET',
      params,
    }),

  /**
   * 绑定门店
   * POST /api/v1/platform/user/bindStore
   * 接口ID：374215166
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-374215166
   */
  bindStore: (params: {
    user_id: number;
    store_pairs: {
      store_id: number;
      company_id: number;
    }[];
  }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/bindStore`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 绑定供应商
    POST /api/v1/platform/user/bindSupplier
    接口ID：374219061
    接口地址：https://app.apifox.com/link/project/7357392/apis/api-374219061
   */
  bindSupplier: (params: { user_id: number; supplier_code: string }) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/bindSupplier`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 获取用户门店
   * GET /api/v1/platform/user/listUserStore
   * 接口ID：374218538
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-374218538
   */
  listUserStore: (params: { user_id: number }) =>
    request<ResponseInfoType<UserStoreInfo>>(`${API_PREFIX}/listUserStore`, {
      method: 'GET',
      params,
    }),
};
