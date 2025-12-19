import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import { QuoteAPI } from '@/services/quote';
import type {
  GetSupplierQuotesParams,
  SupplierQuoteResponse,
} from '@/services/quote/typings.d';
import { Card, message } from 'antd';
import React, { useRef, useState } from 'react';
import { formatDate } from '../PurchaseDetail/utils';
import { getColumns } from './column';
import ShipModal from './components/ShipModal';
import { searchForm } from './searchForm';

const SupplierQuoteList: React.FC = () => {
  const listRef = useRef<BaseListPageRef>(null);
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] =
    useState<SupplierQuoteResponse | null>(null);

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

  // 处理发货
  const handleShip = (record: SupplierQuoteResponse) => {
    setSelectedQuote(record);
    setShipModalVisible(true);
  };

  // 提交发货
  const handleShipSubmit = async (trackingNoList: string[], remark: string) => {
    if (!selectedQuote) return;

    try {
      setShipLoading(true);
      await QuoteAPI.shipQuote({
        quote_no: selectedQuote.quote_no,
        tracking_no_list: trackingNoList,
        remark: remark,
      });
      message.success('发货成功');
      setShipModalVisible(false);
      setSelectedQuote(null);
      // 刷新列表
      listRef.current?.getData();
    } catch (error: any) {
      message.error(error?.message || '发货失败');
      console.error('发货失败:', error);
    } finally {
      setShipLoading(false);
    }
  };

  return (
    <>
      <Card>
        <BaseListPage
          ref={listRef}
          title="供应商报价列表"
          columns={getColumns({ onShip: handleShip })}
          fetchData={fetchData}
          searchFormItems={searchForm}
          searchParamsTransform={searchParamsTransform}
        />
      </Card>

      <ShipModal
        visible={shipModalVisible}
        loading={shipLoading}
        onOk={handleShipSubmit}
        onCancel={() => {
          setShipModalVisible(false);
          setSelectedQuote(null);
        }}
      />
    </>
  );
};

export default SupplierQuoteList;
