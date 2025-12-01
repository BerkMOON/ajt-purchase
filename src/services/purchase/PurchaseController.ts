import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { InquiryDetail } from '../inquiry/typings';
import type {
  CreatePurchaseParams,
  DraftListResponse,
  PageInfo_PurchaseItem,
  PurchaseOrderDetailResponse,
  PurchaseParams,
  UpdatePurchaseParams,
} from './typings';

const API_PREFIX = '/api/v1/purchase';

export const PurchaseAPI = {
  /**
   * 获取采购单列表（正式）
   * GET /api/v1/purchaseOrder/list
   * 支持筛选：order_no, store_id, status, ctime_start, ctime_end
   */
  getAllPurchases: async (params: PurchaseParams) => {
    return request<ResponseInfoType<PageInfo_PurchaseItem>>(
      `${API_PREFIX}/order/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 获取草稿列表
   * GET /api/v1/purchaseOrder/draft/list
   */
  getDraftPurchases: async () => {
    return request<ResponseInfoType<DraftListResponse>>(
      `${API_PREFIX}/draft/list`,
      {
        method: 'GET',
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
   * 获取草稿详情
   * GET /api/v1/purchaseOrder/draft/detail
   */
  getDraftDetail: async (storeId: number) => {
    return request<ResponseInfoType<any>>(`${API_PREFIX}/draft/detail`, {
      method: 'GET',
      params: { store_id: storeId },
    });
  },

  /**
   * 创建草稿
   * POST /api/v1/purchaseOrder/draft/create
   */
  createDraft: async (params: CreatePurchaseParams) => {
    return request<ResponseInfoType<{ store_id: number }>>(
      `${API_PREFIX}/draft/create`,
      {
        method: 'POST',
        data: params,
      },
    );
  },

  /**
   * 更新草稿
   * POST /api/v1/purchaseOrder/draft/update
   */
  updateDraft: async (params: UpdatePurchaseParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/draft/update`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 删除草稿
   * DELETE /api/v1/purchaseOrder/draft/delete
   */
  deleteDraft: async (storeId: number) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/draft/delete`, {
      method: 'POST',
      data: { store_id: storeId },
    });
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
};
