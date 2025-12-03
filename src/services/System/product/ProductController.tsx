import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  GetProductListParams,
  ProductDetailResponse,
  ProductListResponse,
  ProductParams,
  ProductResponse,
  UpdateProductStatusParams,
} from './typings';

const API_PREFIX = '/api/v1/platform/product/item';

export const ProductAPI = {
  /**
   * 新建产品
   * POST /api/v1/platform/product/item/create
   * 接口ID：384380996
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384380996
   */
  createProduct: async (params: ProductParams) => {
    return request<ResponseInfoType<ProductResponse>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 更新产品信息
   * POST /api/v1/platform/product/item/update
   * 接口ID：384382020
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384382020
   */
  updateProduct: async (params: ProductParams) => {
    return request<ResponseInfoType<ProductResponse>>(`${API_PREFIX}/update`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 产品详情
   * GET /api/v1/platform/product/item/detail
   * 接口ID：384386579
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384386579
   */
  getProductDetail: async (product_id: number) => {
    return request<ResponseInfoType<ProductDetailResponse>>(
      `${API_PREFIX}/detail`,
      {
        method: 'GET',
        params: { product_id },
      },
    );
  },

  /**
   * 修改产品状态
   * POST /api/v1/platform/product/item/status
   * 接口ID：384387279
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384387279
   */
  updateProductStatus: async (params: UpdateProductStatusParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/status`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 删除产品
   * POST /api/v1/platform/product/item/delete
   * 接口ID：384388051
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384388051
   */
  deleteProduct: async (product_id: number) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/delete`, {
      method: 'POST',
      data: { product_id },
    });
  },

  /**
   * 产品列表
   * GET /api/v1/platform/product/item/list
   * 接口ID：384871640
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384871640
   */
  getProductList: async (params: GetProductListParams) => {
    return request<ResponseInfoType<ProductListResponse>>(
      `${API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },
};
