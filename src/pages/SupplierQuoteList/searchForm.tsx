import { QuoteStatusMap } from '@/services/quote/constant';
import { Col, DatePicker, Form, Input, Select } from 'antd';

const { RangePicker } = DatePicker;

export const searchForm = (
  <>
    <Col>
      <Form.Item name="quote_no" label="报价单号">
        <Input placeholder="请输入报价单号" allowClear />
      </Form.Item>
    </Col>
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
