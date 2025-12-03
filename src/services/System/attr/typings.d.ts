import { COMMON_CATEGORY_STATUS } from '@/constants';
import { StatusInfo } from '@/types/common';

export interface CreateAttrAndValueParams {
  attrs: Attr[];
  product_id: number;
}

export interface Attr {
  attr_code: string;
  attr_name: string;
  sort: number;
  values: AttrValue[];
}

export interface AttrValue {
  sort: number;
  value_code: string;
  value_name: string;
}

export interface AppendAttrParams {
  attr: Attr;
  product_id: number;
}

export interface UpdateAttrParams {
  attr_code: string;
  attr_name?: string;
  product_id: number;
  sort?: number;
}

export interface UpdateAttrStatusParams {
  attr_code: string;
  product_id: number;
  /**
   * active生效，disabled失效
   */
  status: COMMON_CATEGORY_STATUS;
}

export interface GetAttrListParams {
  needActive?: boolean;
  product_id: number;
}

export interface AttrListResponse {
  attrs: Attr[];
}

export interface DeleteAttrParams {
  attr_code: string;
  product_id: number;
}

export interface AppendAttrValueParams {
  attr_code: string;
  product_id: number;
  sort: number;
  value_code: string;
  value_name: string;
}

export type UpdateAttrValueParams = AppendAttrValueParams;

export interface UpdateAttrValueStatusParams {
  attr_code: string;
  product_id: number;
  /**
   * active生效，disabled失效
   */
  status: COMMON_CATEGORY_STATUS;
  value_code: string;
}

export interface DeleteAttrValueParams {
  attr_code: string;
  product_id: number;
  value_code: string;
}

export interface GetAttrValueListParams {
  attr_code: string;
  product_id: number;
}

export interface AttrValueInfo extends AttrValue {
  status: StatusInfo;
}

export interface AttrValueListResponse {
  values: AttrValueInfo[];
}
