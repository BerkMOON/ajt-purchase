import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import type { Attr, AttrValueInfo } from '@/services/system/attr/typings';
import { StatusInfo } from '@/types/common';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface AttributeValueTableProps {
  attr: Attr & { status?: StatusInfo };
  values: AttrValueInfo[];
  onEdit: (attr: Attr & { status?: StatusInfo }, value: AttrValueInfo) => void;
  onDelete: (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => void;
  onChangeStatus: (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => void;
}

const AttributeValueTable: React.FC<AttributeValueTableProps> = ({
  attr,
  values,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const columns: ColumnsType<AttrValueInfo> = [
    {
      title: '属性值名称',
      dataIndex: 'value_name',
      key: 'value_name',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: AttrValueInfo) => {
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
      render: (_: any, record: AttrValueInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(attr, record)}
          >
            编辑
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
            onClick={() => onChangeStatus(attr, record)}
          >
            {record.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE
              ? '停用'
              : '启用'}
          </Button>
          <Popconfirm
            title="确定要删除这个属性值吗？"
            onConfirm={() => onDelete(attr, record)}
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
      dataSource={values}
      rowKey="value_code"
      pagination={false}
      size="small"
    />
  );
};

export default AttributeValueTable;
