import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  AddToCartParams,
  CartListResponse,
  RemoveFromCartParams,
  SubmitCartParams,
  UpdateCartQuantityParams,
} from './typings';

const API_PREFIX = '/api/v1/store/purchase/draft';

export const CartAPI = {
  /**
   * 获取购物车详情
   * GET /api/v1/store/purchase/draft/detail
   * 接口ID：386374202
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-386374202
   */
  getCartList: async () => {
    return request<ResponseInfoType<CartListResponse>>(`${API_PREFIX}/detail`, {
      method: 'GET',
    });
  },

  /**
   * 新增sku
   * POST /api/v1/store/purchase/draft/sku/append
   * 接口ID：386371134
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-386371134
   */

  addToCart: async (params: AddToCartParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/sku/append`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 删除sku
   * POST /api/v1/store/purchase/draft/sku/delete
   * 接口ID：386371951
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-386371951
   */
  removeFromCart: async (params: RemoveFromCartParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/sku/delete`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 修改sku数量
   * POST /api/v1/store/purchase/draft/sku/update
   * 接口ID：386372812
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-386372812
   */
  updateCartQuantity: async (params: UpdateCartQuantityParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/sku/update`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 清空购物车
   * POST /api/v1/store/purchase/draft/clear
   * 接口ID：386389837
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-386389837
   */
  clearCart: async () => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/clear`, {
      method: 'POST',
    });
  },

  /**
   * 提交购物车
   * POST /api/v1/store/purchase/draft/submit
   * 接口ID：386461624
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-386461624
   */
  submitCart: async (params: SubmitCartParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/submit`, {
      method: 'POST',
      data: params,
    });
  },
};
