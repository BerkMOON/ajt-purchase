import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { ReviewAPI } from '@/services/system/review/ReviewController';
import type { ApprovalListRequest } from '@/services/system/review/typings';
import { Navigate, useAccess } from '@umijs/max';
import { Card, Result } from 'antd';
import React, { useRef } from 'react';
import { formatDate } from '../../PurchaseDetail/utils';
import { getColumns } from './columns';
import { searchForm } from './searchForm';

const ApprovalRecordList: React.FC = () => {
  const { isLogin, reviewList } = useAccess();
  const listRef = useRef<BaseListPageRef>(null);

  // 获取审批记录列表数据
  const fetchData = async (
    params: ApprovalListRequest & { date_range?: any[] },
  ) => {
    if (params.date_range) {
      params.start_time = formatDate(params.date_range[0]);
      params.end_time = formatDate(params.date_range[1]);
      delete params.date_range;
    }

    const response = await ReviewAPI.getApprovalList(params);
    return {
      list: response.data?.item_list || [],
      total: response.data?.count?.total_count || 0,
    };
  };

  // 转换搜索参数
  const searchParamsTransform = (values: any) => {
    const transformed: any = {
      ...values,
    };

    // 日期范围转换为 start_time 和 end_time
    if (
      values.date_range &&
      Array.isArray(values.date_range) &&
      values.date_range.length === 2
    ) {
      transformed.start_time = formatDate(values.date_range[0]);
      transformed.end_time = formatDate(values.date_range[1]);
      delete transformed.date_range;
    }

    return transformed;
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!reviewList) {
    return (
      <Result status="403" title="403" subTitle="无权限访问审批记录列表" />
    );
  }

  return (
    <Card>
      <BaseListPage
        ref={listRef}
        title="审批记录列表"
        columns={getColumns()}
        searchFormItems={searchForm}
        fetchData={fetchData}
        searchParamsTransform={searchParamsTransform}
      />
    </Card>
  );
};

export default ApprovalRecordList;
