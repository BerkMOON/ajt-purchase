import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { CategoryParams, CategoryResponse } from '../system/category/typing';
import {
  GetProductListParams,
  ProductListResponse,
} from '../system/product/typings';
import {
  GetSkuListByProductParams,
  SkuListResponse,
} from '../system/sku/typings';
import type {
  ConfirmArrivalParams,
  CreatePurchaseParams,
  OrderQuoteDetailResponse,
  PurchaseListResponse,
  PurchaseOrderDetailResponse,
  PurchaseOrderStatusLogResponse,
  PurchaseParams,
  SendSupplierInquiryParams,
  SubmitOrderParams,
} from './typings';

const API_PREFIX = '/api/v1/store/purchase/order';
const PRODUCT_API_PREFIX = '/api/v1/store/purchase/shop';

export const PurchaseAPI = {
  /**
   * 获取采购单列表（正式）
   * GET /api/v1/purchaseOrder/list
   * 支持筛选：order_no, store_id, status, ctime_start, ctime_end
   */
  getAllPurchases: async (params: PurchaseParams) => {
    return request<ResponseInfoType<PurchaseListResponse>>(
      `${API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 获取采购单详情
   * GET /api/v1/purchaseOrder/detail
   */
  getPurchaseDetail: async (orderNo: string) => {
    return request<ResponseInfoType<PurchaseOrderDetailResponse>>(
      `${API_PREFIX}/detail`,
      {
        method: 'GET',
        params: { order_no: orderNo },
      },
    );
  },

  /**
   * 确认到货
   * POST /api/v1/purchaseOrder/confirmArrival
   */
  confirmArrival: async (arrivalParams: ConfirmArrivalParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/arrive`, {
      method: 'POST',
      data: arrivalParams,
    });
  },

  /**
   * 获取采购单状态流转记录
   * GET /api/v1/purchaseOrder/statusLog/list
   */
  getPurchaseStatusLog: async (orderNo: string | number) => {
    return request<
      ResponseInfoType<{ logs: PurchaseOrderStatusLogResponse[] }>
    >(`${API_PREFIX}/statusLogs`, {
      method: 'GET',
      params: { order_no: orderNo },
    });
  },

  createOrder: async (params: CreatePurchaseParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/create`, {
      method: 'POST',
      data: params,
    });
  },

  sendSupplierInquiry: async (params: SendSupplierInquiryParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/launchInquiry`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 按商品选择供应商（新版）
   * POST /api/v1/purchaseOrder/quote/selectSuppliers
   */
  selectSuppliersByItems: async (params: SubmitOrderParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/selectSupplier`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 获取采购单供应商报价列表（新版）
   * GET /api/v1/purchaseOrder/quote/list
   */
  getSupplierQuotesByOrder: async (orderNo: string | number) => {
    return request<ResponseInfoType<OrderQuoteDetailResponse>>(
      `${API_PREFIX}/quotes`,
      {
        method: 'GET',
        params: { order_no: orderNo },
      },
    );
  },

  endInquiry: async (orderNo: string | number) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/endInquiry`, {
      method: 'POST',
      data: { order_no: orderNo },
    });
  },

  /**
   * 产品列表
   * GET /api/v1/platform/product/item/list
   * 接口ID：384871640
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384871640
   */
  getProductList: async (params: GetProductListParams) => {
    return request<ResponseInfoType<ProductListResponse>>(
      `${PRODUCT_API_PREFIX}/product/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  /**
   * 根据产品获取sku
   * GET /api/v1/platform/product/sku/listByProduct
   * 接口ID：384444075
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-384444075
   */
  getSkuListByProduct: (params: GetSkuListByProductParams) =>
    request<ResponseInfoType<SkuListResponse>>(
      `${PRODUCT_API_PREFIX}/sku/listByProduct`,
      {
        method: 'GET',
        params: {
          product_id: params.product_id,
        },
      },
    ),

  /**
   * 获取下层子节点
   * GET /api/v1/platform/product/category/listChildren
   * 接口ID：382464499
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-382464499
   */
  getChildren: (params: CategoryParams) =>
    request<ResponseInfoType<CategoryResponse>>(
      `${PRODUCT_API_PREFIX}/category/listChildren`,
      {
        method: 'GET',
        params,
      },
    ),

  submitOrder: async (orderNo: string | number) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/submit`, {
      method: 'POST',
      data: { order_no: orderNo },
    });
  },
};
