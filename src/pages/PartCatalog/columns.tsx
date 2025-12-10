import { PurchaseAPI } from '@/services/purchase';
import type { ProductInfo } from '@/services/system/product/typings';
import type { SkuListInfo } from '@/services/system/sku/typings';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

export const getColumns = (): ColumnsType<ProductInfo> => {
  return [
    {
      title: '产品ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 100,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'product_type',
      key: 'product_type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{type === 'parts' ? '备件' : type || '备件'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
    },
  ];
};

// SKU子表格组件
export const SkuExpandableTable: React.FC<{
  productId: number;
  onAddToCart: (sku: SkuListInfo & { product_id?: number }) => void;
  expanded: boolean;
}> = ({ productId, onAddToCart, expanded }) => {
  const [skus, setSkus] = useState<SkuListInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 只在展开时加载数据
    if (!expanded) {
      setSkus([]);
      return;
    }

    const fetchSkus = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const response = await PurchaseAPI.getSkuListByProduct({
          product_id: productId,
        });
        setSkus(response.data.sku_list || []);
      } catch (error) {
        console.error('获取SKU列表失败:', error);
        setSkus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkus();
  }, [productId, expanded]);

  const skuColumns: ColumnsType<SkuListInfo> = [
    {
      title: 'SKU ID',
      dataIndex: 'sku_id',
      key: 'sku_id',
      width: 100,
    },
    {
      title: 'SKU 名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 200,
    },
    {
      title: '销售属性',
      key: 'attr_pairs',
      width: 250,
      render: (_, record) => {
        if (!record.attr_pairs || record.attr_pairs.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Space wrap>
            {record.attr_pairs.map((pair, index) => (
              <Tag key={index} color="blue">
                {pair.attr_name || pair.attr_code || ''}:{' '}
                {pair.value_name || pair.value_code || ''}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart({ ...record, product_id: productId })}
        >
          加入购物车
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
      </div>
    );
  }

  if (skus.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
        暂无SKU
      </div>
    );
  }

  return (
    <Table
      columns={skuColumns}
      dataSource={skus}
      rowKey="sku_id"
      pagination={false}
      size="small"
    />
  );
};
