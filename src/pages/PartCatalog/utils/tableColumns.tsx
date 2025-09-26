import { AccessoryInfo, PartsInfo } from '@/services/purchase/typings.d';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';

// 备件列表表格列定义
export const createPartsColumns = (
  onAddToCart: (item: PartsInfo | AccessoryInfo) => void,
) => [
  {
    title: '配件编码',
    dataIndex: 'part_code',
    key: 'part_code',
    width: 120,
  },
  {
    title: '配件名称',
    dataIndex: 'part_name',
    key: 'part_name',
    width: 150,
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
    width: 100,
  },
  {
    title: '规格型号',
    dataIndex: 'specification',
    key: 'specification',
    width: 120,
  },
  {
    title: '适用车型',
    key: 'applicable_models',
    width: 200,
    render: (_: any, record: PartsInfo) => (
      <span>{record.applicable_models?.join(', ')}</span>
    ),
  },
  {
    title: '历史均价',
    dataIndex: 'historical_avg_price',
    key: 'historical_avg_price',
    width: 100,
    render: (price: number) => (price ? `¥${price.toFixed(2)}` : '-'),
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render: (_: any, record: PartsInfo | AccessoryInfo) => (
      <Button
        type="primary"
        size="small"
        icon={<ShoppingCartOutlined />}
        onClick={() => onAddToCart(record)}
      >
        加入
      </Button>
    ),
  },
];

// 精品列表表格列定义
export const createAccessoriesColumns = (
  onAddToCart: (item: PartsInfo | AccessoryInfo) => void,
) => [
  {
    title: '商品编码',
    dataIndex: 'part_code',
    key: 'part_code',
    width: 120,
  },
  {
    title: '商品名称',
    dataIndex: 'part_name',
    key: 'part_name',
    width: 150,
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
    width: 100,
  },
  {
    title: '规格型号',
    dataIndex: 'specification',
    key: 'specification',
    width: 120,
  },
  {
    title: '供应商',
    key: 'supplier_name',
    width: 120,
    render: (_: any, record: AccessoryInfo) => (
      <span>{record.supplier_name}</span>
    ),
  },
  {
    title: '价格',
    key: 'fixed_price',
    width: 100,
    render: (_: any, record: AccessoryInfo) => (
      <span style={{ color: '#f50', fontWeight: 'bold' }}>
        ¥{record.fixed_price.toFixed(2)}
      </span>
    ),
  },
  {
    title: '库存状态',
    key: 'stock_status',
    width: 100,
    render: (_: any, record: AccessoryInfo) => {
      const colors = {
        IN_STOCK: 'success',
        OUT_OF_STOCK: 'error',
        DISCONTINUED: 'default',
      };
      const texts = {
        IN_STOCK: '有库存',
        OUT_OF_STOCK: '缺货',
        DISCONTINUED: '停产',
      };
      return (
        <Tag color={colors[record.stock_status]}>
          {texts[record.stock_status]}
        </Tag>
      );
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render: (_: any, record: AccessoryInfo) => (
      <Button
        type="primary"
        size="small"
        icon={<ShoppingCartOutlined />}
        disabled={record.stock_status !== 'IN_STOCK'}
        onClick={() => onAddToCart(record)}
      >
        加入
      </Button>
    ),
  },
];
