import { InquiryItemStatus } from '@/services/inquiry';
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
          <Select.Option value={InquiryItemStatus.PENDING}>
            未选择
          </Select.Option>
          <Select.Option value={InquiryItemStatus.QUOTED}>已选中</Select.Option>
          <Select.Option value={InquiryItemStatus.CANCELLED}>
            未选中
          </Select.Option>
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
