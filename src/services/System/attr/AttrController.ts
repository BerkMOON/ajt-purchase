import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  AppendAttrParams,
  AppendAttrValueParams,
  AttrListResponse,
  AttrValueListResponse,
  CreateAttrAndValueParams,
  DeleteAttrParams,
  DeleteAttrValueParams,
  GetAttrListParams,
  GetAttrValueListParams,
  UpdateAttrParams,
  UpdateAttrStatusParams,
  UpdateAttrValueParams,
  UpdateAttrValueStatusParams,
} from './typings';

const API_PREFIX = '/api/v1/platform/product/attr';

export const AttrAPI = {
  /**
   * 初始创建销售属性和值
   * POST /api/v1/platform/product/attr/createAttrAndValue
   * 接口ID：384390977
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384390977
   */
  createAttrAndValue: (params: CreateAttrAndValueParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/createAttrAndValue`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 新增销售属性
   * POST /api/v1/platform/product/attr/append
   * 接口ID：384392944
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384392944
   */
  appendAttr: (params: AppendAttrParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/append`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新销售属性
   * POST /api/v1/platform/product/attr/update
   * 接口ID：384395144
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384395144
   */
  updateAttr: (params: UpdateAttrParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 修改销售属性状态
   * POST /api/v1/platform/product/attr/status
   * 接口ID：384396864
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384396864
   */
  updateAttrStatus: (params: UpdateAttrStatusParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 获取销售属性列表
   * GET /api/v1/platform/product/attr/list
   * 接口ID：384402469
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384402469
   */
  getAttrList: (params: GetAttrListParams) =>
    request<ResponseInfoType<AttrListResponse>>(`${API_PREFIX}/list`, {
      method: 'GET',
      params: params,
    }),

  /**
   * 删除销售属性
    POST /api/v1/platform/product/attr/delete
    接口ID：384405210
    接口地址：https://app.apifox.com/link/project/7357392/apis/api-384405210
   */
  deleteAttr: (params: DeleteAttrParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/delete`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 新增销售属性值
   * POST /api/v1/platform/product/attr/value/append
   * 接口ID：384406745
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384406745
   */
  appendAttrValue: (params: AppendAttrValueParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/value/append`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新销售属性值
   * POST /api/v1/platform/product/attr/value/update
   * 接口ID：384407473
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384407473
   */
  updateAttrValue: (params: UpdateAttrValueParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/value/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 修改销售属性值状态
   * POST /api/v1/platform/product/attr/value/status
   * 接口ID：384408421
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384408421
   */
  updateAttrValueStatus: (params: UpdateAttrValueStatusParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/value/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 删除销售属性值
   * POST /api/v1/platform/product/attr/value/delete
   * 接口ID：384412322
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384412322
   */
  deleteAttrValue: (params: DeleteAttrValueParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/value/delete`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 查询销售属性值
   * GET /api/v1/platform/product/attr/value/list
   * 接口ID：384414960
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384414960
   */
  getAttrValueList: (params: GetAttrValueListParams) =>
    request<ResponseInfoType<AttrValueListResponse>>(
      `${API_PREFIX}/value/list`,
      {
        method: 'GET',
        params: params,
      },
    ),
};
