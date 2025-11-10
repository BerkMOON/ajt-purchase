import CompanySelect from '@/components/BusinessComponents/CompanySelect';
import { COMMON_STATUS } from '@/constants';
import { Col, Form, Input, Select } from 'antd';

export const searchForm = (
  <>
    <Col>
      <Form.Item name="store_name" label="门店名称">
        <Input placeholder="请输入门店名称" allowClear />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="company_id" label="公司">
        <CompanySelect style={{ width: '220px' }} />
      </Form.Item>
    </Col>
    <Col>
      <Form.Item name="status" label="门店状态">
        <Select
          placeholder="请选择门店状态"
          allowClear
          style={{ width: 200 }}
          options={[
            { label: '生效', value: COMMON_STATUS.ACTIVE },
            { label: '已失效', value: COMMON_STATUS.DELETED },
          ]}
        />
      </Form.Item>
    </Col>
  </>
);
