import QuantityControl from '@/components/BasicComponents/QuantityControl';
import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import type { CartItem } from '@/services/cart/typings';
import type { CategoryTree } from '@/services/system/product/typings';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface CartColumnsHandlers {
  handleQuantityChange: (skuId: number, newQuantity: number) => void;
  handleIncrease: (item: CartItem) => void;
  handleDecrease: (item: CartItem) => void;
  handleRemove: (skuId: number) => void;
  loading: boolean;
  showDeleteConfirm?: boolean; // 是否显示删除确认弹窗
  actionColumnWidth?: number; // 操作列宽度
  skuIdColumnWidth?: number; // SKU ID 列宽度
  fixedActionColumn?: boolean; // 是否固定操作列
}

export const getCartColumns = ({
  handleQuantityChange,
  handleRemove,
  loading,
  showDeleteConfirm = false,
  actionColumnWidth = 80,
  skuIdColumnWidth = 110,
  fixedActionColumn = false,
}: CartColumnsHandlers): ColumnsType<CartItem> => {
  return [
    // {
    //   title: 'SKU ID',
    //   dataIndex: 'sku_id',
    //   key: 'sku_id',
    //   width: skuIdColumnWidth,
    // },
    {
      title: '产品编码',
      dataIndex: 'third_code',
      key: 'third_code',
      width: skuIdColumnWidth,
    },
    {
      title: 'SKU 名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 150,
      ellipsis: true,
    },
    // {
    //   title: '销售属性',
    //   key: 'attr_pairs',
    //   width: 250,
    //   render: (_, record) => {
    //     if (!record.attr_pairs || record.attr_pairs.length === 0) {
    //       return <span style={{ color: '#999' }}>-</span>;
    //     }
    //     return (
    //       <Space wrap>
    //         {record.attr_pairs.map((pair, index) => (
    //           <Tag key={index} color="blue">
    //             {pair.attr_name || pair.attr_code || ''}:{' '}
    //             {pair.value_name || pair.value_code || ''}
    //           </Tag>
    //         ))}
    //       </Space>
    //     );
    //   },
    // },
    {
      title: '商品品类',
      key: 'category_tree',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        if (record.category_tree && record.category_tree.length > 0) {
          return record.category_tree
            .map((cat: CategoryTree) => cat.name)
            .join(' > ');
        }
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
    {
      title: '商品状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        if (!record.status) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const isActive =
          record.status.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;
        return (
          <Tag color={isActive ? 'success' : 'default'}>
            {record.status.name || (isActive ? '启用' : '停用')}
          </Tag>
        );
      },
    },
    {
      title: '数量',
      key: 'quantity',
      width: 200,
      render: (_: any, record: CartItem) => {
        return (
          <QuantityControl
            record={record}
            loading={loading}
            onQuantityChange={handleQuantityChange}
          />
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: actionColumnWidth,
      ...(fixedActionColumn && { fixed: 'right' as const }),
      render: (_: any, record: CartItem) => {
        const removeButton = (
          <Button
            type="link"
            danger
            size="small"
            icon={showDeleteConfirm ? <DeleteOutlined /> : undefined}
            onClick={() => handleRemove(record.sku_id)}
            disabled={loading}
          >
            {showDeleteConfirm ? '删除' : '移除'}
          </Button>
        );

        if (showDeleteConfirm) {
          return (
            <Popconfirm
              title="确定要删除这个商品吗？"
              onConfirm={() => handleRemove(record.sku_id)}
              okText="确定"
              cancelText="取消"
            >
              {removeButton}
            </Popconfirm>
          );
        }

        return removeButton;
      },
    },
  ];
};
