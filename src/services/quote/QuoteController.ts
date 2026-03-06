import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  DispatchQuoteParams,
  GetSupplierQuotesParams,
  GetSupplierQuotesResponse,
  SubmitSupplierQuoteParams,
  SupplierQuoteResponse,
} from './typings';

const API_PREFIX = '/api/v1/supplier/order/quote';
const PLATFORM_API_PREFIX = '/api/v1/platform/quote';

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
   * 更新报价
   * POST /api/v1/supplier/order/quote/update
   * 接口ID：423794809
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-423794809
   */
  updateSupplierQuote: async (params: SubmitSupplierQuoteParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/update`, {
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

  /**
   * 商品发货
   * POST /api/v1/supplier/order/quote/dispatch
   * 接口ID：392715318
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-392715318
   */
  shipQuote: async (params: DispatchQuoteParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/dispatch`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 报价单列表
   * GET /api/v1/platform/quote/list
   * 接口ID：421611147
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-421611147
   */
  getQuoteList: async (params: GetSupplierQuotesParams) => {
    return request<ResponseInfoType<GetSupplierQuotesResponse>>(
      `${PLATFORM_API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 报价单详情
   * GET /api/v1/platform/quote/detail
   * 接口ID：421612066
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-421612066
   */
  getQuoteDetail: async (quoteNo: number | string) => {
    return request<ResponseInfoType<SupplierQuoteResponse>>(
      `${PLATFORM_API_PREFIX}/detail`,
      {
        method: 'GET',
        params: { quote_no: quoteNo },
      },
    );
  },
};
