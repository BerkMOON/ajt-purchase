import { COMMON_STATUS } from '@/constants';
import { BaseListInfo, StatusInfo } from '@/types/common';

export interface CreateSupplierRequest {
  address?: string;
  /**
   * 开户账号
   */
  bank_account?: string;
  /**
   * 开户行
   */
  bank_name?: string;
  city?: string;
  contacts?: string;
  /**
   * 所属公司
   */
  corporation?: string;
  /**
   * 社会信用代码
   */
  credit_code?: string;
  email?: string;
  phone?: string;
  province?: string;
  remark?: string;
  supplier_code: string;
  supplier_name: string;
  /**
   * 税号
   */
  tax_number?: string;
}

export interface SupplierListRequest {
  city?: string;
  limit?: number;
  page?: number;
  province?: string;
  /**
   * active生效，disabled失效，deleted删除
   */
  status?: COMMON_STATUS;
  supplier_code?: string;
  supplier_name?: string;
}

export interface SupplierInfo {
  address: string;
  bank_account: string;
  bank_name: string;
  city: string;
  contacts: string;
  corporation: string;
  create_time: string;
  credit_code: string;
  email: string;
  id: string;
  modify_time: string;
  phone: string;
  province: string;
  remark: string;
  status: StatusInfo;
  supplier_code: string;
  supplier_name: string;
  supplier_type: string;
  tax_number: string;
  brand_infos: BrandInfo[];
}

export interface BrandInfo {
  brand_id: number;
  brand_name: string;
}

export interface SupplierListResponse extends BaseListInfo {
  suppliers: SupplierInfo[];
}
