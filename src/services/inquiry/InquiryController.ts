import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  InquiryDetail,
  SendInquiryParams,
  SubmitNoQuoteReasonParams,
  SupplierInquiryDetail,
  SupplierInquiryDetailParams,
  SupplierInquiryListParams,
} from './typings';

const API_PREFIX = '/api/v1/inquiry';
const SUPPLIER_API_PREFIX = '/api/v1/supplier/inquiry';

export const InquiryAPI = {
  /**
   * 发送询价
   * POST /api/v1/inquiry/send
   */
  sendInquiry: async (params: SendInquiryParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/send`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 查询询价单详情
   * GET /api/v1/inquiry/detail
   */
  getInquiryDetail: async (inquiryNo: string | number) => {
    return request<ResponseInfoType<InquiryDetail>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { inquiry_no: inquiryNo },
    });
  },

  /**
   * 供应商查看自己的询价列表
   * GET /api/v1/supplier/inquiry/list
   */
  getSupplierInquiries: async (params: SupplierInquiryListParams = {}) => {
    return request<
      ResponseInfoType<{
        total?: {
          total_count: number;
          total_page: number;
        };
        list: SupplierInquiryDetail[];
      }>
    >(`${SUPPLIER_API_PREFIX}/list`, {
      method: 'GET',
      params: {
        page: 1,
        limit: 10,
        ...params,
      },
    });
  },

  /**
   * 供应商查看询价详情
   * GET /api/v1/supplier/inquiry/detail
   */
  getSupplierInquiryDetail: async (params: SupplierInquiryDetailParams) => {
    return request<ResponseInfoType<SupplierInquiryDetail>>(
      `${SUPPLIER_API_PREFIX}/detail`,
      {
        method: 'GET',
        params: {
          inquiry_no: params.inquiry_no,
          ...(params.supplier_code
            ? { supplier_code: params.supplier_code }
            : {}),
        },
      },
    );
  },

  /**
   * 供应商提交未报价原因
   * POST /api/v1/inquiry/noQuote
   */
  submitNoQuoteReason: async (params: SubmitNoQuoteReasonParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/noQuote`, {
      method: 'POST',
      data: params,
    });
  },
};
