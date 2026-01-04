import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import {
  ApprovalListRequest,
  ApprovalListResponse,
  ApproveQuoteParams,
  GetPendingApprovalQuotesParams,
  PendingApprovalQuotesResponse,
} from './typings';

const API_PREFIX = '/api/v1/platform/order';

export const ReviewAPI = {
  /**
   * 报价审批
   * POST /api/v1/platform/order/quote/approve
   * 接口ID：398183617
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-398183617
   */
  approveQuote: async (params: ApproveQuoteParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/quote/approve`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 获取待审批报价
   * GET /api/v1/platform/order/quote/listPendingApproval
   * 接口ID：398182823
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-398182823
   */
  getPendingApprovalQuotes: async (params: GetPendingApprovalQuotesParams) => {
    return request<ResponseInfoType<PendingApprovalQuotesResponse>>(
      `${API_PREFIX}/quote/listPendingApproval`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 审批记录列表
   * GET /api/v1/platform/order/approval/list
   * 接口ID：399441980
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-399441980
   */
  getApprovalList: async (params: ApprovalListRequest) => {
    return request<ResponseInfoType<ApprovalListResponse>>(
      `${API_PREFIX}/approval/list`,
      {
        method: 'GET',
        params,
      },
    );
  },
};
