import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { ReviewAPI } from '@/services/system/review/ReviewController';
import { Navigate, useAccess } from '@umijs/max';
import { Card, Result } from 'antd';
import React, { useRef } from 'react';
import { getColumns } from './columns';

const ReviewList: React.FC = () => {
  const { isLogin, reviewList } = useAccess();
  const listRef = useRef<BaseListPageRef>(null);

  // 获取待审批报价列表数据
  const fetchData = async (params: any) => {
    const response = await ReviewAPI.getPendingApprovalQuotes({
      page: params.page,
      limit: params.limit,
    });
    return {
      list: response.data?.quotes || [],
      total: response.data?.count?.total_count || 0,
    };
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!reviewList) {
    return <Result status="403" title="403" subTitle="无权限访问审批列表" />;
  }

  return (
    <Card>
      <BaseListPage
        ref={listRef}
        title="审批列表"
        columns={getColumns()}
        fetchData={fetchData}
      />
    </Card>
  );
};

export default ReviewList;
