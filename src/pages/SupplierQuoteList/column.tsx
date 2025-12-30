import { SupplierQuoteResponse } from '@/services/quote';
import { QuoteStatus, QuoteStatusTagColor } from '@/services/quote/constant';
import { formatPriceToYuan } from '@/utils/prince';
import { history } from '@umijs/max';
import { Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { formatDate } from '../PurchaseDetail/utils';

interface ColumnsHandlers {
  onShip: (record: SupplierQuoteResponse) => void;
}

export const getColumns = ({
  onShip,
}: ColumnsHandlers): ColumnsType<SupplierQuoteResponse> => [
  {
    title: '报价单号',
    dataIndex: 'quote_no',
    key: 'quote_no',
    render: (quoteNo: number) => (
      <a
        onClick={() => {
          history.push(`/supplier-quote-detail/${quoteNo}`);
        }}
      >
        {quoteNo}
      </a>
    ),
  },
  {
    title: '询价单号',
    dataIndex: 'inquiry_no',
    key: 'inquiry_no',
  },
  {
    title: '采购单号',
    dataIndex: 'order_no',
    key: 'order_no',
  },
  {
    title: '商品名称',
    dataIndex: 'sku_name',
    key: 'sku_name',
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
  },
  {
    title: '报价单价',
    dataIndex: 'quote_price',
    key: 'quote_price',
    align: 'right',
    render: (price: number) => formatPriceToYuan(price),
  },
  {
    title: '报价总价',
    dataIndex: 'total_price',
    key: 'total_price',
    align: 'right',
    render: (price: number) => formatPriceToYuan(price),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: {
      code: keyof typeof QuoteStatusTagColor;
      name: string;
    }) => <Tag color={QuoteStatusTagColor[status.code]}>{status.name}</Tag>,
  },
  {
    title: '预计交货日期',
    dataIndex: 'expected_delivery_date',
    key: 'expected_delivery_date',
    render: (date: string) => formatDate(date, true),
  },
  {
    title: '提交时间',
    dataIndex: 'submit_time',
    key: 'submit_time',
    render: (time: string) => formatDate(time),
  },
  {
    title: '创建时间',
    dataIndex: 'ctime',
    key: 'ctime',
    render: (time: string) => formatDate(time),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    render: (_: any, record: SupplierQuoteResponse) => {
      const isPendingShipment =
        record.status.code === QuoteStatus.PENDING_SHIPMENT;

      if (!isPendingShipment) {
        return null;
      }

      return (
        <Space>
          <Button type="primary" size="small" onClick={() => onShip(record)}>
            发货
          </Button>
        </Space>
      );
    },
  },
];
