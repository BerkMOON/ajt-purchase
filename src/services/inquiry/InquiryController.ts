import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

import type {
  InquiryDetailResponse,
  InquiryListRequest,
  InquiryListResponse,
  SupplierInquiryDetailParams,
} from './typings';

const SUPPLIER_API_PREFIX = '/api/v1/store/purchase/inquiry';

export const InquiryAPI = {
  /**
   * 供应商查看自己的询价列表
   * GET /api/v1/supplier/inquiry/list
   */
  getSupplierInquiries: async (params: InquiryListRequest) => {
    return request<ResponseInfoType<InquiryListResponse>>(
      `${SUPPLIER_API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 供应商查看询价详情
   * GET /api/v1/supplier/inquiry/detail
   */
  getSupplierInquiryDetail: async (params: SupplierInquiryDetailParams) => {
    return request<ResponseInfoType<InquiryDetailResponse>>(
      `${SUPPLIER_API_PREFIX}/detail`,
      {
        method: 'GET',
        params,
      },
    );
  },
};
