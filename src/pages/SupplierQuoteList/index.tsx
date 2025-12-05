import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { QuoteAPI } from '@/services/quote';
import type { GetSupplierQuotesParams } from '@/services/quote/typings.d';
import { Card } from 'antd';
import React, { useRef } from 'react';
import { formatDate } from '../PurchaseDetail/utils';
import { columns } from './column';
import { searchForm } from './searchForm';

const SupplierQuoteList: React.FC = () => {
  const listRef = useRef<BaseListPageRef>(null);

  const fetchData = async (params: GetSupplierQuotesParams) => {
    const response = await QuoteAPI.getSupplierQuotes(params);
    return {
      list: response.data?.quotes || [],
      total: response.data?.count?.total_count || 0,
    };
  };

  const searchParamsTransform = (
    params: any,
  ): Partial<GetSupplierQuotesParams> => {
    const result: Partial<GetSupplierQuotesParams> = {
      page: params.page,
      limit: params.limit,
    };

    if (params.quote_no) {
      result.quote_no = params.quote_no;
    }
    if (params.order_no) {
      result.order_no = params.order_no;
    }
    if (params.status) {
      result.status = params.status;
    }
    if (params.ctime_range) {
      const [start, end] = params.ctime_range || [];
      if (start) {
        result.ctime_start = formatDate(start);
      }
      if (end) {
        result.ctime_end = formatDate(end);
      }
    }

    return result;
  };

  return (
    <Card>
      <BaseListPage
        ref={listRef}
        title="供应商报价列表"
        columns={columns}
        fetchData={fetchData}
        searchFormItems={searchForm}
        searchParamsTransform={searchParamsTransform}
      />
    </Card>
  );
};

export default SupplierQuoteList;
