import {
  AccessoryInfo,
  CategoryType,
  PartsInfo,
} from '@/services/purchase/typings.d';
import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select, Table, Tabs } from 'antd';
import React from 'react';
import {
  createAccessoriesColumns,
  createPartsColumns,
} from '../utils/tableColumns';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface PartsListProps {
  loading: boolean;
  parts: (PartsInfo | AccessoryInfo)[];
  searchParams: {
    category_type: CategoryType;
    page: number;
    page_size: number;
  };
  onTabChange: (key: string) => void;
  onSearch: (value: string) => void;
  onUpdateParams: (params: any) => void;
  onAddToCart: (item: PartsInfo | AccessoryInfo) => void;
}

const PartsList: React.FC<PartsListProps> = ({
  loading,
  parts,
  searchParams,
  onTabChange,
  onSearch,
  onUpdateParams,
  onAddToCart,
}) => {
  const partsColumns = createPartsColumns(onAddToCart);
  const accessoriesColumns = createAccessoriesColumns(onAddToCart);

  return (
    <Tabs activeKey={searchParams.category_type} onChange={onTabChange}>
      <TabPane tab="备件目录" key={CategoryType.PARTS}>
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
          dataSource={parts.filter(
            (item) => item.category_type === CategoryType.PARTS,
          )}
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
      </TabPane>

      <TabPane tab="精品目录" key={CategoryType.ACCESSORIES}>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="搜索商品名称或编码"
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={onSearch}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="库存状态"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => {
                  onUpdateParams({
                    stock_status: value,
                    page: 1,
                  });
                }}
              >
                <Option value="IN_STOCK">有库存</Option>
                <Option value="OUT_OF_STOCK">缺货</Option>
                <Option value="DISCONTINUED">停产</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          loading={loading}
          dataSource={parts.filter(
            (item) => item.category_type === CategoryType.ACCESSORIES,
          )}
          columns={accessoriesColumns}
          rowKey="part_id"
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.page_size,
            onChange: (page, pageSize) => {
              onUpdateParams({ page, page_size: pageSize });
            },
          }}
        />
      </TabPane>
    </Tabs>
  );
};

export default PartsList;
