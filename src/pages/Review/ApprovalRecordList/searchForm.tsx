import { REVIEW_RESULT } from '@/services/system/review/constants';
import { Col, DatePicker, Form, Input, Select } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const searchForm = (
  <>
    <Col>
      <Form.Item name="order_no" label="采购单号">
        <Input placeholder="请输入采购单号" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="quote_no" label="报价单号">
        <Input placeholder="请输入报价单号" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="sku_id" label="SKU ID">
        <Input placeholder="请输入SKU ID" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="result" label="审批结果">
        <Select
          style={{ width: '200px' }}
          placeholder="请选择审批结果"
          allowClear
        >
          <Option value={REVIEW_RESULT.APPROVE}>通过</Option>
          <Option value={REVIEW_RESULT.REJECT}>拒绝</Option>
        </Select>
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="date_range" label="审批时间">
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          placeholder={['开始时间', '结束时间']}
        />
      </Form.Item>
    </Col>
  </>
);
