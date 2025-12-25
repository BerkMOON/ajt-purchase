import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  CreateOrUpdatePriceParams,
  CreateSkuParams,
  GetSkuListByProductParams,
  SkuDetailResponse,
  SkuListResponse,
  UpdateSkuParams,
  UpdateSkuStatusParams,
} from './typings';

const API_PREFIX = '/api/v1/platform/product/sku';

export const SkuAPI = {
  /**
   * 根据产品获取sku
   * GET /api/v1/platform/product/sku/listByProduct
   * 接口ID：384444075
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384444075
   */
  getSkuListByProduct: (params: GetSkuListByProductParams) =>
    request<ResponseInfoType<SkuListResponse>>(`${API_PREFIX}/listByProduct`, {
      method: 'GET',
      params: {
        product_id: params.product_id,
      },
    }),

  /**
   * 获取sku详情
   * GET /api/v1/platform/product/sku/detail
   * 接口ID：384434304
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384434304
   */
  getSkuDetail: (sku_id: number) =>
    request<ResponseInfoType<SkuDetailResponse>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: {
        sku_id: sku_id,
      },
    }),

  /**
   * 新建sku
   * POST /api/v1/platform/product/sku/create
   * 接口ID：384429081
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384429081
   */
  createSku: (params: CreateSkuParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 更新sku
   * POST /api/v1/platform/product/sku/update
   * 接口ID：384430687
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384430687
   */
  updateSku: (params: UpdateSkuParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 修改sku状态
   * POST /api/v1/platform/product/sku/status
   * 接口ID：384446004
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384446004
   */
  updateSkuStatus: (params: UpdateSkuStatusParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    }),

  /**
   * 删除sku
   * POST /api/v1/platform/product/sku/delete
   * 接口ID：384445004
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384445004
   */
  deleteSku: (sku_id: number) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/delete`, {
      method: 'POST',
      data: {
        sku_id: sku_id,
      },
    }),

  /**
   * 设置sku价格信息
   * POST /api/v1/platform/product/sku/createOrUpdatePrice
   * 接口ID：394193516
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-394193516
   */
  createOrUpdatePrice: (params: CreateOrUpdatePriceParams) =>
    request<ResponseInfoType<null>>(`${API_PREFIX}/createOrUpdatePrice`, {
      method: 'POST',
      data: params,
    }),
};
