import CountdownText from '@/components/BasicComponents/CountdownText';
import { InquiryAPI, SupplierInquiryItem } from '@/services/inquiry';
import { InquiryStatusTagColor } from '@/services/inquiry/constant';
import { UserInfo } from '@/services/system/user/typings';
import { Navigate, history, useAccess, useModel } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Result,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { formatDate } from '../PurchaseDetail/utils';

const SupplierPortal: React.FC = () => {
  const { isLogin } = useAccess();
  const { initialState } = useModel('@@initialState');
  const rawSupplierInfos = (initialState as UserInfo)?.supplier_infos ?? [];
  const supplierInfos = (rawSupplierInfos || []).map((info: any) => ({
    supplier_id: info?.supplier_id ?? info?.id ?? 0,
    supplier_name: info?.supplier_name ?? info?.name ?? '',
  }));
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(
    supplierInfos?.[0]?.supplier_id || 0,
  );
  const selectedSupplierName = useMemo(() => {
    return (
      supplierInfos?.find(
        (item: any) => item?.supplier_id === selectedSupplierId,
      )?.supplier_name || supplierInfos?.[0]?.supplier_name
    );
  }, [selectedSupplierId, supplierInfos]);

  const [inquiries, setInquiries] = useState<SupplierInquiryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState<{
    inquiry_no?: string;
    order_no?: string;
    status?: number;
    start_date?: string;
    end_date?: string;
  }>({});

  // 获取供应商的询价单列表
  const fetchInquiries = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
  ) => {
    if (!selectedSupplierId) return;
    try {
      setLoading(true);
      const response = await InquiryAPI.getSupplierInquiries({
        page,
        limit: pageSize,
        ...filters,
      });

      setInquiries(response.data?.inquiries || []);
      setPagination({
        current: page,
        pageSize,
        total: response.data?.count?.total_count || 0,
      });
    } catch (error) {
      message.error('获取询价信息失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSupplierId) {
      fetchInquiries(1, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplierId, filters]);

  // 处理筛选
  const handleFilter = (values: any) => {
    const newFilters: typeof filters = {};
    if (values.inquiry_no) {
      newFilters.inquiry_no = values.inquiry_no;
    }
    if (values.order_no) {
      newFilters.order_no = values.order_no;
    }
    if (values.status !== undefined && values.status !== null) {
      newFilters.status = values.status;
    }
    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.start_date = formatDate(values.dateRange[0], true);
      newFilters.end_date = formatDate(values.dateRange[1], true);
    }
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 重置筛选
  const handleReset = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 进入报价页面
  const goToQuote = (inquiryNo: string) => {
    const url = `/supplier-quote/${inquiryNo}?supplier_id=${
      selectedSupplierId || ''
    }`;
    history.push(url);
  };

  // 检查询价是否已过期
  const isInquiryExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  // 表格列定义
  const columns = [
    {
      title: '询价单号',
      dataIndex: 'inquiry_no',
      key: 'inquiry_no',
      render: (inquiryNo: number) => (
        <a onClick={() => goToQuote(inquiryNo.toString())}>{inquiryNo}</a>
      ),
    },
    {
      title: '采购单号',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (text: string) => text,
    },
    {
      title: '希望交货日期',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (date: string) => formatDate(date, true),
    },
    {
      title: '询价截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => {
        const expired = isInquiryExpired(deadline);
        return (
          <span style={{ color: expired ? 'red' : 'inherit' }}>
            <CountdownText deadline={deadline} />
          </span>
        );
      },
    },
    {
      title: '询价状态',
      key: 'status',
      render: (_: any, record: SupplierInquiryItem) => {
        return (
          <Tag
            color={
              InquiryStatusTagColor[
                record.status.code as keyof typeof InquiryStatusTagColor
              ] || 'default'
            }
          >
            {record.status.name}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      key: 'ctime',
      render: (time: string) => formatDate(time),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SupplierInquiryItem) => {
        const expired = isInquiryExpired(record.deadline);
        const isQuoted = record.status.code === 1 || record.status.code === 3;

        return (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => goToQuote(record.inquiry_no.toString())}
              disabled={expired && !isQuoted}
            >
              {isQuoted ? '查看报价' : expired ? '已过期' : '立即报价'}
            </Button>
          </Space>
        );
      },
    },
  ];

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!supplierInfos || supplierInfos.length === 0) {
    return (
      <Result
        status="warning"
        title="当前账号未绑定供应商"
        subTitle="请联系平台管理员绑定供应商后再访问供应商门户。"
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="供应商询价门户">
        {/* 供应商信息 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="供应商名称">
              {selectedSupplierName || supplierInfos?.[0]?.supplier_name}
            </Descriptions.Item>
            <Descriptions.Item label="供应商ID">
              {selectedSupplierId || supplierInfos?.[0]?.supplier_id}
            </Descriptions.Item>
            {supplierInfos.length > 1 && (
              <Descriptions.Item label="切换供应商" span={2}>
                <Select
                  value={selectedSupplierId}
                  onChange={(value) => {
                    setSelectedSupplierId(value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  style={{ width: 260 }}
                  options={supplierInfos.map((item: any) => ({
                    label: `${item.supplier_name}（${item.supplier_code}）`,
                    value: item.supplier_code,
                  }))}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 使用说明 */}
        <Alert
          message="供应商报价流程指引"
          description={
            <div>
              <p>
                <strong>报价流程：</strong>
              </p>
              <ol>
                <li>查看下方询价单列表，了解采购需求</li>
                <li>点击&quot;立即报价&quot;按钮，为每个配件填写报价信息</li>
                <li>填写单价、品牌、产地、单项交货时间等信息</li>
                <li>注意询价截止时间，过期后无法提交报价</li>
                <li>如无法报价，可点击&quot;不报价&quot;按钮并说明原因</li>
                <li>采购方将根据价格、质量、交货期等因素选择供应商</li>
              </ol>
              <p style={{ color: 'red', marginTop: 8 }}>
                <strong>注意：</strong>
                报价后仍可修改，但请在截止时间前完成。
              </p>
            </div>
          }
          type="info"
          style={{ marginBottom: 16 }}
          showIcon
        />

        {/* 筛选表单 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form
            layout="inline"
            onFinish={handleFilter}
            initialValues={{
              status: undefined,
            }}
          >
            <Row gutter={[24, 12]} style={{ width: '100%' }}>
              <Col span={6}>
                <Form.Item name="inquiry_no" label="询价单号">
                  <Input placeholder="请输入询价单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="order_no" label="采购单号">
                  <Input placeholder="请输入采购单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="status" label="询价状态">
                  <Select
                    placeholder="请选择状态"
                    allowClear
                    style={{ width: '100%' }}
                    options={[
                      { label: '待报价', value: 0 },
                      { label: '已报价', value: 1 },
                      { label: '已超时', value: 2 },
                      { label: '已选中', value: 3 },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dateRange" label="创建时间">
                  <DatePicker.RangePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    placeholder={['开始日期', '结束日期']}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ textAlign: 'right', width: '100%', marginTop: 16 }}>
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        {/* 询价单列表 */}
        <Table
          columns={columns}
          dataSource={inquiries}
          rowKey="inquiry_no"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => fetchInquiries(page, pageSize),
          }}
          locale={{
            emptyText:
              inquiries?.length === 0 && !loading
                ? '暂无待报价的询价单'
                : undefined,
          }}
        />
      </Card>
    </div>
  );
};

export default SupplierPortal;
