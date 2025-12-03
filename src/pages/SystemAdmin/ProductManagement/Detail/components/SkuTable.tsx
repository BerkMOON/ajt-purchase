import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import type { SkuListInfo } from '@/services/system/sku/typings';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface SkuTableProps {
  skus: SkuListInfo[];
  onDelete: (skuId: number) => void;
  onChangeStatus: (sku: SkuListInfo) => void;
}

const SkuTable: React.FC<SkuTableProps> = ({
  skus,
  onDelete,
  onChangeStatus,
}) => {
  const columns: ColumnsType<SkuListInfo> = [
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
    },
    {
      title: '销售属性',
      key: 'attr_pairs',
      render: (_: any, record: SkuListInfo) => {
        if (!record.attr_pairs || record.attr_pairs.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Space wrap>
            {record.attr_pairs.map((pair, index) => (
              <Tag key={index} color="blue">
                {pair.attr_name}: {pair.value_name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: SkuListInfo) => {
        const isActive =
          record.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;
        return isActive ? (
          <Tag color="success">启用</Tag>
        ) : (
          <Tag color="default">停用</Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: SkuListInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              if (record.sku_id) {
                history.push(`/admin/sku/${record.sku_id}`);
              }
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={
              record.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE ? (
                <CloseCircleOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => onChangeStatus(record)}
          >
            {record.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE
              ? '停用'
              : '启用'}
          </Button>
          <Popconfirm
            title="确定要删除这个 SKU 吗？"
            onConfirm={() => record.sku_id && onDelete(record.sku_id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={skus}
      rowKey="sku_id"
      pagination={false}
      size="small"
    />
  );
};

export default SkuTable;
