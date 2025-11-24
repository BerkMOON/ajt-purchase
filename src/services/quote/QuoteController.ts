import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  QuoteComparisonItem,
  QuoteDetail,
  SelectSupplierParams,
  SelectSuppliersByItemsParams,
  SubmitQuoteParams,
  SubmitSupplierQuoteParams,
  SupplierQuoteListByOrder,
} from './typings';

const API_PREFIX = '/api/v1/quote';
const SUPPLIER_QUOTE_PREFIX = '/api/v1/supplier/quote';
const PURCHASE_ORDER_QUOTE_PREFIX = '/api/v1/purchaseOrder/quote';

export const QuoteAPI = {
  /**
   * 供应商提交报价（旧版）
   * POST /api/v1/quote/submit
   */
  submitQuote: async (params: SubmitQuoteParams) => {
    return request<ResponseInfoType<{ quote_no: string }>>(
      `${API_PREFIX}/submit`,
      {
        method: 'POST',
        data: params,
      },
    );
  },

  /**
   * 查询采购单的报价列表
   * GET /api/v1/quote/list
   */
  getQuotesByOrder: async (orderNo: string | number) => {
    return request<
      ResponseInfoType<{ order_no: string; quotes: QuoteDetail[] }>
    >(`${API_PREFIX}/list`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
  },

  /**
   * 查询报价详情
   * GET /api/v1/quote/detail
   */
  getQuoteDetail: async (quoteNo: string | number) => {
    return request<ResponseInfoType<QuoteDetail>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { quote_no: quoteNo },
    });
  },

  /**
   * 获取报价比价信息
   * GET /api/v1/quote/comparison
   */
  getQuoteComparison: async (orderNo: string | number) => {
    return request<ResponseInfoType<QuoteComparisonItem[]>>(
      `${API_PREFIX}/comparison`,
      {
        method: 'GET',
        params: { order_no: orderNo },
      },
    );
  },

  /**
   * 选择供应商（旧版，按报价单选择）
   * POST /api/v1/quote/selectSupplier
   */
  selectSupplier: async (params: SelectSupplierParams) => {
    return request<ResponseInfoType<{ message: string }>>(
      `${API_PREFIX}/selectSupplier`,
      {
        method: 'POST',
        data: params,
      },
    );
  },

  /**
   * 按商品选择供应商（新版）
   * POST /api/v1/purchaseOrder/quote/selectSuppliers
   */
  selectSuppliersByItems: async (params: SelectSuppliersByItemsParams) => {
    return request<ResponseInfoType<null>>(
      `${PURCHASE_ORDER_QUOTE_PREFIX}/selectSuppliers`,
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
    return request<ResponseInfoType<null>>(`${SUPPLIER_QUOTE_PREFIX}/submit`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 获取采购单供应商报价列表（新版）
   * GET /api/v1/purchaseOrder/quote/list
   */
  getSupplierQuotesByOrder: async (orderNo: string | number) => {
    return request<ResponseInfoType<SupplierQuoteListByOrder>>(
      `${PURCHASE_ORDER_QUOTE_PREFIX}/list`,
      {
        method: 'GET',
        params: { order_no: orderNo },
      },
    );
  },
};
