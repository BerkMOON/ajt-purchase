import {
  AccessoryInfo,
  CategoryType,
  PartsInfo,
} from '@/services/purchase/typings.d';
import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Table } from 'antd';
import React from 'react';
import { createPartsColumns } from '../utils/tableColumns';

const { Search } = Input;

interface PartsListProps {
  loading: boolean;
  parts: (PartsInfo | AccessoryInfo)[];
  searchParams: {
    category_type: CategoryType;
    page: number;
    page_size: number;
  };
  onSearch: (value: string) => void;
  onUpdateParams: (params: any) => void;
  onAddToCart: (item: PartsInfo | AccessoryInfo) => void;
}

const PartsList: React.FC<PartsListProps> = ({
  loading,
  parts,
  searchParams,
  onSearch,
  onUpdateParams,
  onAddToCart,
}) => {
  const partsColumns = createPartsColumns(onAddToCart);

  return (
    <div>
      {/* 【修改】暂时去除精品目录Tab，只保留备件目录 */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索配件名称、编码或规格"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={onSearch}
            />
          </Col>
        </Row>
      </div>

      <Table
        loading={loading}
        dataSource={
          parts.filter(
            (item) => item.category_type === CategoryType.PARTS,
          ) as PartsInfo[]
        }
        columns={partsColumns}
        rowKey="part_id"
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.page_size,
          onChange: (page, pageSize) => {
            onUpdateParams({ page, page_size: pageSize });
          },
        }}
      />
    </div>
  );
};

export default PartsList;
