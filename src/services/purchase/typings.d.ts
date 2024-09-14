export interface PurchaseItem {
  id: string;
  purchase_no: string;
  create_time: string;
  modify_time: string;
  store_name: string;
  creator_name: string;
  total_amount: number;
  status: PurchaseStatus;
  expected_delivery_date: string;
  remark?: string;
  purchase_details: PurchaseDetailItem[];
}

export interface PurchaseStatus {
  code: number;
  name: string;
}

export interface PurchaseDetailItem {
  id: string;
  part_code: string;
  part_name: string;
  specification: string;
  quantity: number;
  unit: string;
  historical_avg_price?: number;
}

export interface PurchaseParams {
  page?: number;
  page_size?: number;
  purchase_no?: string;
  start_date?: string;
  end_date?: string;
  store_ids?: string[];
  creator_name?: string;
  status_codes?: number[];
  date_range?: any; // 用于前端表单的日期范围选择器
}

export interface CreatePurchaseParams {
  expected_delivery_date: string;
  remark?: string;
  purchase_details: Omit<PurchaseDetailItem, 'id' | 'historical_avg_price'>[];
}

export interface UpdatePurchaseParams extends CreatePurchaseParams {
  purchase_id: string;
}

export interface PageInfo_PurchaseItem {
  meta: {
    total_count: number;
    total_page: number;
  };
  purchase_list: PurchaseItem[];
}

export const PurchaseStatusMap = {
  1: { code: 1, name: '草稿' },
  2: { code: 2, name: '待审核' },
  3: { code: 3, name: '审核通过' },
  4: { code: 4, name: '已驳回' },
  5: { code: 5, name: '待询价' },
  6: { code: 6, name: '已报价' },
  7: { code: 7, name: '订单待审核' },
  8: { code: 8, name: '已下单' },
  9: { code: 9, name: '已完成' },
};
