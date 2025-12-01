import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  OrderQuoteDetailResponse,
  SubmitOrderParams,
  SubmitSupplierQuoteParams,
} from './typings';

const API_PREFIX = '/api/v1/purchase/quote';
const ORDER_API_PREFIX = '/api/v1/purchase/order';

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
};
