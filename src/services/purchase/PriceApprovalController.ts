import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

const API_PREFIX = '/api/v1/priceApproval';

export interface CheckPriceThresholdResult {
  need_approval: boolean;
  is_over_threshold: boolean;
  total_amount: number;
  historical_avg_amount: number;
  over_threshold_ratio: number;
  threshold_percent: number;
}

export interface CreateApprovalParams {
  order_id: number;
  quote_id: number;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  historical_avg_amount: number;
  over_threshold_ratio: number;
  applicant_id: number;
  applicant_name: string;
  apply_reason: string;
}

export interface ApprovalDetail {
  id: number;
  approval_no: string;
  order_id: number;
  order_no: string;
  quote_id: number;
  quote_no: string;
  supplier_id: number;
  supplier_name: string;
  total_amount: number;
  historical_avg_amount: number;
  over_threshold_ratio: number;
  approval_status: {
    code: number;
    name: string;
  };
  applicant_id: number;
  applicant_name: string;
  apply_time: string;
  apply_reason: string;
  approver_id: number;
  approver_name: string;
  approve_time: string;
  approve_remark: string;
  create_time: string;
}

export interface ApproveParams {
  approval_id: number;
  approver_id: number;
  approver_name: string;
  remark?: string;
}

export const PriceApprovalAPI = {
  /**
   * 检查价格阈值
   * GET /api/v1/priceApproval/checkThreshold
   */
  checkPriceThreshold: async (quoteId: number) => {
    return request<ResponseInfoType<CheckPriceThresholdResult>>(
      `${API_PREFIX}/checkThreshold`,
      {
        method: 'GET',
        params: { quote_id: quoteId },
      },
    );
  },

  /**
   * 创建价格审批
   * POST /api/v1/priceApproval/create
   */
  createApproval: async (params: CreateApprovalParams) => {
    return request<ResponseInfoType<{ approval_no: string }>>(
      `${API_PREFIX}/create`,
      {
        method: 'POST',
        data: params,
      },
    );
  },

  /**
   * 审批通过
   * POST /api/v1/priceApproval/approve
   */
  approvePrice: async (params: ApproveParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/approve`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 审批驳回
   * POST /api/v1/priceApproval/reject
   */
  rejectPrice: async (params: ApproveParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/reject`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 获取待审批列表
   * GET /api/v1/priceApproval/pendingList
   */
  getPendingApprovals: async (params: { page: number; size: number }) => {
    return request<
      ResponseInfoType<{
        list: ApprovalDetail[];
        total: number;
      }>
    >(`${API_PREFIX}/pendingList`, {
      method: 'GET',
      params,
    });
  },

  /**
   * 获取审批详情
   * GET /api/v1/priceApproval/detail
   */
  getApprovalDetail: async (approvalNo: string) => {
    return request<ResponseInfoType<ApprovalDetail>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { approval_no: approvalNo },
    });
  },

  /**
   * 根据报价获取审批
   * GET /api/v1/priceApproval/byQuote
   */
  getApprovalByQuote: async (quoteId: number) => {
    return request<ResponseInfoType<ApprovalDetail>>(`${API_PREFIX}/byQuote`, {
      method: 'GET',
      params: { quote_id: quoteId },
    });
  },
};
