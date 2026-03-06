import SupplierSelect from '@/components/BusinessComponents/SupplierSelect';
import { QuoteStatusMap } from '@/services/quote/constant';
import { useAccess } from '@umijs/max';
import { Col, DatePicker, Form, Input, Select } from 'antd';
import React from 'react';

const { RangePicker } = DatePicker;

// 仅平台用户展示供应商ID筛选
const SupplierFilterCol: React.FC = () => {
  const { isPlatform } = useAccess();

  if (!isPlatform) {
    return null;
  }

  return (
    <Col>
      <Form.Item name="supplier_id" label="供应商">
        <SupplierSelect placeholder="请选择供应商" style={{ width: '180px' }} />
      </Form.Item>
    </Col>
  );
};

export const searchForm = (
  <>
    <Col>
      <Form.Item name="quote_no" label="报价单号">
        <Input placeholder="请输入报价单号" allowClear />
      </Form.Item>
    </Col>
    <SupplierFilterCol />
    <Col>
      <Form.Item name="order_no" label="采购单号">
        <Input placeholder="请输入采购单号" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="状态">
        <Select style={{ width: '200px' }} placeholder="请选择状态" allowClear>
          {Object.entries(QuoteStatusMap).map(([key, value]) => (
            <Select.Option key={key} value={key}>
              {value}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="purchase_type" label="采购类型">
        <Select
          style={{ width: '200px' }}
          placeholder="请选择采购类型"
          allowClear
        >
          <Select.Option value="normal">普通采购</Select.Option>
          <Select.Option value="return">回采</Select.Option>
        </Select>
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="ctime_range" label="创建时间">
        <RangePicker
          showTime
          placeholder={['开始时间', '结束时间']}
          format="YYYY-MM-DD HH:mm:ss"
        />
      </Form.Item>
    </Col>
  </>
);
