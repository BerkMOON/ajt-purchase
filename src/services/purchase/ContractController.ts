import type { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';

const API_PREFIX = '/api/v1/contract';

export interface CreateContractParams {
  order_id: number;
  quote_id: number;
  supplier_id: number;
  supplier_name: string;
  store_id: number;
  store_name: string;
  contract_amount: number;
  expected_delivery_date: string; // YYYY-MM-DD
  creator_id: number;
  creator_name: string;
  remark?: string;
}

export interface ContractDetail {
  id: number;
  contract_no: string;
  order_id: number;
  order_no: string;
  quote_id: number;
  quote_no: string;
  supplier_id: number;
  supplier_name: string;
  store_id: number;
  store_name: string;
  contract_amount: number;
  expected_delivery_date: string;
  contract_status: {
    code: number;
    name: string;
  };
  creator_id: number;
  creator_name: string;
  create_order_time: string;
  send_time: string;
  delivery_time: string;
  receive_time: string;
  complete_time: string;
  remark: string;
  create_time: string;
  update_time: string;
  items: ContractItemDetail[];
}

export interface ContractItemDetail {
  id: number;
  contract_id: number;
  contract_no: string;
  quote_item_id: number;
  part_id: number;
  part_code: string;
  part_name: string;
  specification: string;
  unit: string;
  quantity: number;
  contract_price: number;
  contract_amount: number;
  received_quantity: number;
  last_receive_time: string;
  arrival_certificate_urls: string;
  arrival_exception_type: string;
  arrival_exception_remark: string;
  brand: string;
  origin: string;
  remark: string;
}

export interface ContractListParams {
  page: number;
  size: number;
  contract_status?: number;
  store_id?: number;
  supplier_id?: number;
  contract_no?: string;
  order_no?: string;
}

export interface SendToSupplierParams {
  contract_id: number;
  operator_id: number;
  operator_name: string;
}

export interface RecordReceiveParams {
  contract_id: number;
  operator_id: number;
  operator_name: string;
  items: RecordReceiveItemParams[];
}

export interface RecordReceiveItemParams {
  contract_item_id: number;
  received_quantity: number;
  arrival_certificate_urls?: string;
  arrival_exception_type?: string;
  arrival_exception_remark?: string;
}

export interface CompleteContractParams {
  contract_id: number;
  operator_id: number;
  operator_name: string;
}

export interface CancelContractParams {
  contract_id: number;
  operator_id: number;
  operator_name: string;
  reason: string;
}

export const ContractAPI = {
  /**
   * 创建采购合同
   * POST /api/v1/contract/create
   */
  createContract: async (params: CreateContractParams) => {
    return request<ResponseInfoType<{ contract_no: string }>>(
      `${API_PREFIX}/create`,
      {
        method: 'POST',
        data: params,
      },
    );
  },

  /**
   * 获取合同列表
   * GET /api/v1/contract/list
   */
  getContractList: async (params: ContractListParams) => {
    return request<
      ResponseInfoType<{
        list: ContractDetail[];
        total: number;
      }>
    >(`${API_PREFIX}/list`, {
      method: 'GET',
      params,
    });
  },

  /**
   * 获取合同详情
   * GET /api/v1/contract/detail
   */
  getContractDetail: async (contractNo: string) => {
    return request<ResponseInfoType<ContractDetail>>(`${API_PREFIX}/detail`, {
      method: 'GET',
      params: { contract_no: contractNo },
    });
  },

  /**
   * 发送给供应商
   * POST /api/v1/contract/send
   */
  sendToSupplier: async (params: SendToSupplierParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/send`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 记录收货
   * POST /api/v1/contract/receive
   */
  recordReceive: async (params: RecordReceiveParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/receive`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 完成合同
   * POST /api/v1/contract/complete
   */
  completeContract: async (params: CompleteContractParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/complete`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 取消合同
   * POST /api/v1/contract/cancel
   */
  cancelContract: async (params: CancelContractParams) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/cancel`, {
      method: 'POST',
      data: params,
    });
  },
};
