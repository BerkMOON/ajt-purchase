import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  GetSupplierQuotesParams,
  GetSupplierQuotesResponse,
  OrderQuoteDetailResponse,
  SubmitOrderParams,
  SubmitSupplierQuoteParams,
  SupplierQuoteResponse,
} from './typings';

const API_PREFIX = '/api/v1/store/purchase/quote';
const ORDER_API_PREFIX = '/api/v1/store/purchase/order';

export const QuoteAPI = {
  /**
   * 按商品选择供应商（新版）
   * POST /api/v1/purchaseOrder/quote/selectSuppliers
   */
  selectSuppliersByItems: async (params: SubmitOrderParams) => {
    return request<ResponseInfoType<null>>(
      `${ORDER_API_PREFIX}/select-supplier`,
      {
        method: 'POST',
        data: params,
      },
    );
  },

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
   * 获取采购单供应商报价列表（新版）
   * GET /api/v1/purchaseOrder/quote/list
   */
  getSupplierQuotesByOrder: async (orderNo: string | number) => {
    return request<ResponseInfoType<OrderQuoteDetailResponse[]>>(
      `${ORDER_API_PREFIX}/quotes`,
      {
        method: 'GET',
        params: { order_no: orderNo },
      },
    );
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
