import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import type {
  CreatePurchaseParams,
  PageInfo_PurchaseItem,
  PurchaseItem,
  PurchaseParams,
  UpdatePurchaseParams,
} from './typings';

const API_PREFIX = '/api/v1/purchaseOrder';

export const PurchaseAPI = {
  getAllPurchases: async (params: PurchaseParams) => {
    return request<ResponseInfoType<PageInfo_PurchaseItem>>(
      `${API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /*
    获取订单草稿列表
    GET /api/v1/purchaseOrder/draft/list
    接口ID：378253302
    接口地址：https://app.apifox.com/link/project/7357392/apis/api-378253302
  */
  getDraftPurchases: async (params: PurchaseParams) => {
    return request<ResponseInfoType<PageInfo_PurchaseItem>>(
      `${API_PREFIX}/draft/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 采购单详情
   * GET /api/v1/purchaseOrder/detail
   * 接口ID：378280248
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-378280248
   */
  getPurchaseDetail: async (orderNo: string) => {
    return request<ResponseInfoType<PurchaseItem>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
  },

  createPurchase: async (params: CreatePurchaseParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    });
  },

  updatePurchase: async (params: UpdatePurchaseParams) => {
    return request<ResponseInfoType<PurchaseItem>>(
      `${API_PREFIX}/${params.purchase_id}`,
      {
        method: 'PUT',
        data: params,
      },
    );
  },

  deletePurchase: async (params: { purchase_id: string }) => {
    return request<ResponseInfoType<null>>(
      `${API_PREFIX}/${params.purchase_id}`,
      {
        method: 'DELETE',
      },
    );
  },

  /**
   * 提交采购单
   * POST /api/v1/purchaseOrder/submit
   * 接口ID：378266173
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-378266173
   */
  submitPurchase: async (orderNo: string) => {
    return request<{
      code: number;
      message: string;
    }>(`${API_PREFIX}/submit`, {
      method: 'POST',
      data: { order_no: orderNo },
    });
  },

  approvePurchase: async (purchaseId: string) => {
    return request<{
      code: number;
      message: string;
    }>(`${API_PREFIX}/${purchaseId}/approve`, {
      method: 'POST',
    });
  },

  rejectPurchase: async (purchaseId: string, reason: string) => {
    return request<{
      code: number;
      message: string;
    }>(`${API_PREFIX}/${purchaseId}/reject`, {
      method: 'POST',
      data: { reason },
    });
  },

  getPurchaseQuotes: async (orderNo: string) => {
    return request<ResponseInfoType<any[]>>(`${API_PREFIX}/quotes`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
  },
};
