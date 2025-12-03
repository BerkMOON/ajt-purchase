import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import type { Attr, AttrValueInfo } from '@/services/system/attr/typings';
import { StatusInfo } from '@/types/common';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Popconfirm, Space, Tag } from 'antd';
import React from 'react';
import AttributeValueTable from './AttributeValueTable';

interface AttributeCardProps {
  attr: Attr & { status?: StatusInfo };
  values: AttrValueInfo[];
  onAddValue: (attr: Attr & { status?: StatusInfo }) => void;
  onEditAttr: (attr: Attr & { status?: StatusInfo }) => void;
  onDeleteAttr: (attr: Attr & { status?: StatusInfo }) => void;
  onChangeAttrStatus: (attr: Attr & { status?: StatusInfo }) => void;
  onEditValue: (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => void;
  onDeleteValue: (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => void;
  onChangeValueStatus: (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => void;
}

const AttributeCard: React.FC<AttributeCardProps> = ({
  attr,
  values,
  onAddValue,
  onEditAttr,
  onDeleteAttr,
  onChangeAttrStatus,
  onEditValue,
  onDeleteValue,
  onChangeValueStatus,
}) => {
  const isActive = attr.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;
  const displayIsActive = attr.status ? isActive : true;

  return (
    <Card
      key={attr.attr_code}
      size="small"
      title={
        <Space>
          <span>{attr.attr_name}</span>
          {displayIsActive ? (
            <Tag color="success">启用</Tag>
          ) : (
            <Tag color="default">停用</Tag>
          )}
          <span style={{ color: '#999', fontSize: 12 }}>排序: {attr.sort}</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onAddValue(attr)}
          >
            新增值
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditAttr(attr)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={
              displayIsActive ? (
                <CloseCircleOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => onChangeAttrStatus(attr)}
          >
            {displayIsActive ? '停用' : '启用'}
          </Button>
          <Popconfirm
            title="确定要删除这个属性吗？删除后该属性的所有值也会被删除。"
            onConfirm={() => onDeleteAttr(attr)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      {values.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#999',
          }}
        >
          暂无属性值
        </div>
      ) : (
        <AttributeValueTable
          attr={attr}
          values={values}
          onEdit={onEditValue}
          onDelete={onDeleteValue}
          onChangeStatus={onChangeValueStatus}
        />
      )}
    </Card>
  );
};

export default AttributeCard;
