import { USER_TYPE_OPTIONS } from '@/constants';
import { Col, Form, Select } from 'antd';
import React from 'react';

export const SearchForm: React.FC<{ onCreate?: () => void }> = () => {
  return (
    <>
      <Col>
        <Form.Item name="module" label="所属模块">
          <Select
            placeholder="请选择模块"
            allowClear
            style={{ width: 220 }}
            options={USER_TYPE_OPTIONS}
          />
        </Form.Item>
      </Col>
    </>
  );
};
