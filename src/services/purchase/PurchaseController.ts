import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { InquiryDetail } from '../inquiry/typings';
import type {
  CreatePurchaseParams,
  DraftListResponse,
  PageInfo_PurchaseItem,
  PurchaseItem,
  PurchaseParams,
  UpdatePurchaseParams,
} from './typings';

const API_PREFIX = '/api/v1/purchaseOrder';

export const PurchaseAPI = {
  /**
   * 获取采购单列表（正式）
   * GET /api/v1/purchaseOrder/list
   * 支持筛选：order_no, store_ids, statuses, start_date, end_date
   */
  getAllPurchases: async (params: PurchaseParams) => {
    return request<ResponseInfoType<PageInfo_PurchaseItem>>(
      `${API_PREFIX}/list`,
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
    return request<ResponseInfoType<PurchaseItem>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
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
      method: 'DELETE',
      params: { store_id: storeId },
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
};

// 状态变更日志类型
export interface PurchaseStatusLog {
  id: number;
  order_id: number;
  order_no: string;
  from_status: {
    code: number;
    name: string;
  };
  to_status: {
    code: number;
    name: string;
  };
  operator_id: number;
  operator_name: string;
  remark: string;
  create_time: string;
}
