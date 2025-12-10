import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  GetSupplierQuotesParams,
  GetSupplierQuotesResponse,
  SubmitSupplierQuoteParams,
  SupplierQuoteResponse,
} from './typings';

const API_PREFIX = '/api/v1/supplier/order/quote';

export const QuoteAPI = {
  /**
   * 供应商提交报价（新版）
   * POST /api/v1/supplier/quote/submit
   */
  submitSupplierQuote: async (params: SubmitSupplierQuoteParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/submit`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 获取供应商报价列表
   * GET /api/v1/purchaseOrder/quote/list
   */
  getSupplierQuotes: async (params: GetSupplierQuotesParams) => {
    return request<ResponseInfoType<GetSupplierQuotesResponse>>(
      `${API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 获取供应商报价详情
   * GET /api/v1/purchaseOrder/quote/detail
   */
  getSupplierQuoteDetail: async (quoteNo: number | string) => {
    return request<ResponseInfoType<SupplierQuoteResponse>>(
      `${API_PREFIX}/detail`,
      {
        method: 'GET',
        params: { quote_no: quoteNo },
      },
    );
  },
};
