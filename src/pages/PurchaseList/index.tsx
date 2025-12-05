import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { type PurchaseParams } from '@/services/purchase/typings.d';
import { Navigate, useAccess } from '@umijs/max';
import { Card, Result } from 'antd';
import React, { useRef } from 'react';
import { formatDate } from '../PurchaseDetail/utils';
import { columns } from './colums';
import { searchForm } from './searchForm';

const PurchaseList: React.FC = () => {
  const { isLogin } = useAccess();
  // 添加权限检查，可以根据实际需求调整
  const { purchaseList } = useAccess();

  const listRef = useRef<BaseListPageRef>(null);

  // 获取采购单数据
  const fetchData = async (params: any) => {
    // 处理日期范围参数
    const searchParams: PurchaseParams = {
      page: params.page,
      limit: params.limit,
    };

    // 采购单号
    if (params.order_no) {
      searchParams.order_no = params.order_no;
    }

    // 门店筛选（单选）
    if (params.store_id) {
      searchParams.store_id = String(params.store_id);
    }

    // 状态筛选（单选）
    if (params.status !== undefined && params.status !== null) {
      searchParams.status = String(params.status);
    }

    // 日期范围
    if (params.date_range) {
      searchParams.ctime_start = formatDate(params.date_range[0]);
      searchParams.ctime_end = formatDate(params.date_range[1]);
    }

    const response = await PurchaseAPI.getAllPurchases(searchParams);
    return {
      list: response.data.orders || [],
      total: response.data.count.total_count,
    };
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!purchaseList) {
    return <Result status="403" title="403" subTitle="无权限访问" />;
  }

  return (
    <Card>
      <BaseListPage
        ref={listRef}
        title="采购单列表"
        columns={columns}
        searchFormItems={searchForm}
        fetchData={fetchData}
      />
    </Card>
  );
};

export default PurchaseList;
