import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { PurchaseItem } from '@/services/purchase/typings';
import { Navigate, useAccess } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

// 模拟供应商数据
const mockSuppliers = [
  { id: '1', name: '北京汽配供应商', contact: '张经理', phone: '138****1234' },
  { id: '2', name: '上海零部件公司', contact: '李经理', phone: '139****5678' },
  { id: '3', name: '广州配件批发商', contact: '王经理', phone: '137****9012' },
];

const SupplierPortal: React.FC = () => {
  const { isLogin } = useAccess();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('1');
  const [inquiries, setInquiries] = useState<PurchaseItem[]>([]);
  const [quotes, setQuotes] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const currentSupplier = mockSuppliers.find(
    (s) => s.id === selectedSupplierId,
  );

  // 获取待询价的采购单
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      // 获取所有采购单，筛选出待询价状态的
      const response = await PurchaseAPI.getAllPurchases({ status_codes: [5] });
      const inquiryList = response.data.purchase_list;
      setInquiries(inquiryList);

      // 获取当前供应商的报价情况
      const quotesData: any = {};
      for (const inquiry of inquiryList) {
        try {
          const quoteResponse = await PurchaseAPI.getPurchaseQuotes(inquiry.id);
          const myQuote = quoteResponse.data.find(
            (q: any) => q.supplier_id === selectedSupplierId,
          );
          quotesData[inquiry.id] = myQuote || null;
        } catch (error) {
          quotesData[inquiry.id] = null;
        }
      }
      setQuotes(quotesData);
    } catch (error) {
      message.error('获取询价信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [selectedSupplierId]);

  // 进入报价页面
  const goToQuote = (purchaseId: string) => {
    const url = `/purchase/${purchaseId}/supplier-quote?supplier=${selectedSupplierId}`;
    window.open(url, '_blank');
  };

  // 表格列定义
  const columns = [
    {
      title: '采购单号',
      dataIndex: 'purchase_no',
      key: 'purchase_no',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '采购门店',
      dataIndex: 'store_name',
      key: 'store_name',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
    },
    {
      title: '期望到货日期',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
    },
    {
      title: '配件数量',
      key: 'parts_count',
      render: (_: any, record: PurchaseItem) =>
        `${record.purchase_details.length} 项`,
    },
    {
      title: '报价状态',
      key: 'quote_status',
      render: (_: any, record: PurchaseItem) => {
        const myQuote = quotes[record.id];
        if (myQuote) {
          return <Tag color="success">已报价</Tag>;
        } else {
          return <Tag color="warning">待报价</Tag>;
        }
      },
    },
    {
      title: '已报价金额',
      key: 'quoted_amount',
      render: (_: any, record: PurchaseItem) => {
        const myQuote = quotes[record.id];
        return myQuote?.total_amount
          ? `¥${myQuote.total_amount.toFixed(2)}`
          : '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PurchaseItem) => {
        const myQuote = quotes[record.id];
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => goToQuote(record.id)}
            >
              {myQuote ? '修改报价' : '立即报价'}
            </Button>
          </Space>
        );
      },
    },
  ];

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="供应商询价门户">
        {/* 供应商选择 */}
        <div style={{ marginBottom: 24 }}>
          <Space align="center">
            <span>当前供应商：</span>
            <Select
              value={selectedSupplierId}
              onChange={setSelectedSupplierId}
              style={{ width: 200 }}
            >
              {mockSuppliers.map((supplier) => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Space>
        </div>

        {/* 供应商信息 */}
        {currentSupplier && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={3} size="small">
              <Descriptions.Item label="供应商名称">
                {currentSupplier.name}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">
                {currentSupplier.contact}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {currentSupplier.phone}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* 使用说明 */}
        <Alert
          message="使用说明"
          description={
            <div>
              <p>
                <strong>供应商报价流程：</strong>
              </p>
              <ol>
                <li>查看下方待报价的询价单列表</li>
                <li>{`点击"立即报价"按钮，在新窗口中填写各配件的报价信息`}</li>
                <li>填写单价、预计交货期等信息后提交报价</li>
                <li>可随时修改已提交的报价，直到采购方选择供应商</li>
                <li>采购方将根据价格、交货期等因素选择最优供应商</li>
              </ol>
            </div>
          }
          type="info"
          style={{ marginBottom: 16 }}
          showIcon
        />

        {/* 询价单列表 */}
        <Table
          columns={columns}
          dataSource={inquiries}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          locale={{
            emptyText:
              inquiries.length === 0 && !loading
                ? '暂无待报价的询价单'
                : undefined,
          }}
        />
      </Card>
    </div>
  );
};

export default SupplierPortal;
