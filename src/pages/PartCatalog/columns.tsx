import { COMMON_STATUS_CODE } from '@/constants';
import type { SkuListInfo } from '@/services/purchase/typings';
import { formatPriceToYuan } from '@/utils/prince';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ColumnsHandlers {
  onAddToCart: (sku: SkuListInfo) => void;
}

export const getColumns = ({
  onAddToCart,
}: ColumnsHandlers): ColumnsType<SkuListInfo> => {
  return [
    {
      title: 'SKU ID',
      dataIndex: 'sku_id',
      key: 'sku_id',
      width: 100,
    },
    {
      title: '产品编码',
      dataIndex: 'third_code',
      key: 'third_code',
      width: 220,
    },
    {
      title: 'SKU 名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '品牌',
      dataIndex: 'brand_name',
      key: 'brand_name',
      width: 120,
    },
    {
      title: '产品ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 100,
    },
    // {
    //   title: '销售属性',
    //   key: 'attr_pairs',
    //   width: 250,
    //   render: (_, record) => {
    //     if (!record.attr_pairs) {
    //       return <span style={{ color: '#999' }}>-</span>;
    //     }

    //     // attr_pairs 是字符串，可能是 JSON 格式
    //     try {
    //       const attrPairs = typeof record.attr_pairs === 'string'
    //         ? JSON.parse(record.attr_pairs)
    //         : record.attr_pairs;

    //       if (Array.isArray(attrPairs) && attrPairs.length > 0) {
    //         return (
    //           <Space wrap>
    //             {attrPairs.map((pair: any, index: number) => (
    //               <Tag key={index} color="blue">
    //                 {pair.attr_name || pair.attr_code || ''}:{' '}
    //                 {pair.value_name || pair.value_code || ''}
    //               </Tag>
    //             ))}
    //           </Space>
    //         );
    //       }
    //     } catch (e) {
    //       // 如果不是 JSON，直接显示字符串
    //       return <span>{record.attr_pairs}</span>;
    //     }

    //     return <span style={{ color: '#999' }}>-</span>;
    //   },
    // },
    {
      title: '原厂价',
      key: 'origin_price',
      width: 100,
      render: (_, record) => {
        return (
          <span>
            {record.price_info?.origin_price
              ? formatPriceToYuan(record.price_info.origin_price)
              : '-'}
          </span>
        );
      },
    },
    {
      title: '建议零售价',
      key: 'ceiling_price',
      width: 120,
      render: (_, record) => {
        return (
          <span>
            {record.price_info?.ceiling_price
              ? formatPriceToYuan(record.price_info.ceiling_price)
              : '-'}
          </span>
        );
      },
    },
    {
      title: '回采价',
      key: 'return_purchase_price',
      width: 100,
      render: (_, record) => {
        return (
          <span>
            {record.price_info?.return_purchase_price
              ? formatPriceToYuan(record.price_info.return_purchase_price)
              : '-'}
          </span>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'product_type',
      key: 'product_type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">
          {type === 'parts'
            ? '备件'
            : type === 'boutique'
            ? '精品'
            : type || '备件'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (!status) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const isActive = status.code === COMMON_STATUS_CODE.ACTIVE;
        return (
          <Tag color={isActive ? 'success' : 'default'}>
            {status.name || (isActive ? '启用' : '停用')}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart(record)}
        >
          加入购物车
        </Button>
      ),
    },
  ];
};
