import { PurchaseStatusMap } from '@/services/purchase/typings.d';
import { Col, DatePicker, Form, Input, Select } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const searchForm = (
  <>
    <Col span={8}>
      <Form.Item name="purchase_no" label="采购单号">
        <Input placeholder="请输入采购单号" allowClear />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="date_range" label="创建日期">
        <RangePicker placeholder={['开始日期', '结束日期']} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="store_ids" label="采购门店">
        <Select
          mode="multiple"
          placeholder="请选择采购门店"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {/* TODO: 从API获取门店列表数据 */}
          <Option value="1">门店A</Option>
          <Option value="2">门店B</Option>
          <Option value="3">门店C</Option>
        </Select>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="creator_name" label="采购人">
        <Input placeholder="请输入采购人姓名" allowClear />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="status_codes" label="采购单状态">
        <Select mode="multiple" placeholder="请选择采购单状态" allowClear>
          {Object.values(PurchaseStatusMap).map((status) => (
            <Option key={status.code} value={status.code}>
              {status.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Col>
  </>
);
