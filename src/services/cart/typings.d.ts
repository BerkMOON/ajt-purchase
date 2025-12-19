import { StatusInfo } from '@/types/common';
import { CategoryTreeInfo } from '../system/product/typings';
import { AttrPair } from '../system/sku/typings';

export interface CartItem {
  product_id: number;
  sku_id: number;
  sku_name: string;
  attr_pairs: AttrPair[];
  status: StatusInfo;
  category_tree: CategoryTreeInfo;
  quantity: number;
}

export interface CartListResponse {
  sku_list: CartItem[];
}

export interface AddToCartParams {
  sku_id: number;
  quantity: number;
}

export interface RemoveFromCartParams {
  sku_id: number;
}

export interface SubmitCartParams {
  expected_delivery_date: string;
  /**
   * parts备件
   */
  order_type: string;
  remark: string;
}

export interface UpdateCartQuantityParams {
  sku_id: number;
  quantity: number;
}
