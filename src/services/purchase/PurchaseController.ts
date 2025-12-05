import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { InquiryDetail } from '../inquiry/typings';
import type {
  CreatePurchaseParams,
  PurchaseListResponse,
  PurchaseOrderDetailResponse,
  PurchaseOrderStatusLogResponse,
  PurchaseParams,
} from './typings';

const API_PREFIX = '/api/v1/store/purchase';

export const PurchaseAPI = {
  /**
   * 获取采购单列表（正式）
   * GET /api/v1/purchaseOrder/list
   * 支持筛选：order_no, store_id, status, ctime_start, ctime_end
   */
  getAllPurchases: async (params: PurchaseParams) => {
    return request<ResponseInfoType<PurchaseListResponse>>(
      `${API_PREFIX}/order/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 获取采购单详情
   * GET /api/v1/purchaseOrder/detail
   */
  getPurchaseDetail: async (orderNo: string) => {
    return request<ResponseInfoType<PurchaseOrderDetailResponse>>(
      `${API_PREFIX}/order/detail`,
      {
        method: 'GET',
        params: { order_no: orderNo },
      },
    );
  },

  /**
   * 提交草稿
   * POST /api/v1/purchaseOrder/draft/submit
   */
  submitDraft: async (storeId: number) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/draft/submit`, {
      method: 'POST',
      data: { store_id: storeId },
    });
  },

  /**
   * 查询采购单的询价列表
   * GET /api/v1/inquiry/list
   */
  getInquiriesByOrder: async (orderNo: string | number) => {
    return request<
      ResponseInfoType<{ order_no: string; quotes: InquiryDetail[] }>
    >(`${API_PREFIX}/quote/list`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
  },

  /**
   * 确认到货
   * POST /api/v1/purchaseOrder/confirmArrival
   */
  confirmArrival: async (quoteNos: number[]) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/order/arrive`, {
      method: 'POST',
      data: { quote_nos: quoteNos },
    });
  },

  /**
   * 获取采购单状态流转记录
   * GET /api/v1/purchaseOrder/statusLog/list
   */
  getPurchaseStatusLog: async (orderNo: string | number) => {
    return request<
      ResponseInfoType<{ logs: PurchaseOrderStatusLogResponse[] }>
    >(`${API_PREFIX}/order/status-logs`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
  },

  createOrder: async (params: CreatePurchaseParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/order/create`, {
      method: 'POST',
      data: params,
    });
  },
};
