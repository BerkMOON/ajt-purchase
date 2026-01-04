import { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';
import { REVIEW_RESULT } from './constants';

export interface GetPendingApprovalQuotesParams extends PageInfoParams {
  quote_no?: number;
}

export interface PendingApprovalQuotesInfo {
  id: number;
  quote_no: number;
  inquiry_no: number;
  order_no: number;
  sku_id: number;
  sku_name: string;
  quantity: number;
  quote_price: number;
  total_price: number;
  status: StatusInfo;
  expected_delivery_date: string;
  remark: string;
  submit_time: string;
  ctime: string;
  mtime: string;
}

export interface ApproveQuoteParams {
  order_no: number;
  quote_no: number;
  result: REVIEW_RESULT;
}

export interface PendingApprovalQuotesResponse extends BaseListInfo {
  quotes: PendingApprovalQuotesInfo[];
}

export interface ApprovalListRequest extends PageInfoParams {
  end_time?: string;
  order_no?: number;
  quote_no?: number;
  /**
   * approved通过，rejected拒绝
   */
  result?: string;
  sku_id?: number;
  start_time?: string;
}

export interface ApprovalInfo {
  order_no: number;
  quote_no: number;
  sku_id: number;
  sku_name: string;
  third_code: string;
  reviewer_id: number;
  reviewer_name: string;
  result: string;
  from_status: StatusInfo;
  to_status: StatusInfo;
  remark: string;
  create_time: string;
}

export interface ApprovalListResponse extends BaseListInfo {
  item_list: ApprovalInfo[];
}
