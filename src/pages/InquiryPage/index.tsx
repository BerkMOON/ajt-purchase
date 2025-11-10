import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import { PurchaseItem } from '@/services/purchase/typings';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess, useParams } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Modal,
  Result,
  Row,
  Space,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';

// 模拟供应商数据
const mockSuppliers = [
  { id: '1', name: '北京汽配供应商', contact: '张经理', phone: '138****1234' },
  { id: '2', name: '上海零部件公司', contact: '李经理', phone: '139****5678' },
  { id: '3', name: '广州配件批发商', contact: '王经理', phone: '137****9012' },
];

// 报价数据结构
interface QuoteItem {
  supplier_id: string;
  supplier_name: string;
  part_quotes: {
    part_id: string;
    unit_price: number;
    total_price: number;
    delivery_date: string;
    remark?: string;
  }[];
  total_amount: number;
  quote_date: string;
  status: 'pending' | 'quoted' | 'selected';
}

const InquiryPage: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);

  // 获取采购单详情和报价数据
  const fetchPurchaseDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [purchaseResponse, quotesResponse] = await Promise.all([
        PurchaseAPI.getPurchaseDetail(id),
        PurchaseAPI.getPurchaseQuotes(id),
      ]);

      setPurchase(purchaseResponse.data);

      // 合并供应商信息和报价数据
      const quotesData = quotesResponse.data;
      const mergedQuotes: QuoteItem[] = mockSuppliers.map((supplier) => {
        const existingQuote = quotesData.find(
          (q: any) => q.supplier_id === supplier.id,
        );

        if (existingQuote) {
          return {
            supplier_id: supplier.id,
            supplier_name: supplier.name,
            part_quotes: existingQuote.part_quotes || [],
            total_amount: existingQuote.total_amount || 0,
            quote_date: existingQuote.quote_date || '',
            status: existingQuote.status || 'pending',
          };
        } else {
          return {
            supplier_id: supplier.id,
            supplier_name: supplier.name,
            part_quotes: [],
            total_amount: 0,
            quote_date: '',
            status: 'pending' as const,
          };
        }
      });

      setQuotes(mergedQuotes);
    } catch (error) {
      message.error('获取采购单详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseDetail();
  }, [id]);

  // 返回详情页
  const goBack = () => {
    history.push(`/purchase/${id}`);
  };

  // 选择供应商
  const handleSelectSupplier = async (record: QuoteItem) => {
    if (!purchase || record.status !== 'quoted') return;

    Modal.confirm({
      title: '确认选择供应商',
      content: `确定选择 ${record.supplier_name} 作为此次采购的供应商吗？`,
      onOk: async () => {
        try {
          await PurchaseAPI.selectSupplier(purchase.id, record.supplier_id);
          message.success('供应商选择成功');
          fetchPurchaseDetail(); // 重新获取数据
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  // 生成订单
  const handleGenerateOrder = async () => {
    if (!purchase) return;

    const selectedQuote = quotes.find((q) => q.status === 'selected');
    if (!selectedQuote) {
      message.warning('请先选择供应商');
      return;
    }

    Modal.confirm({
      title: '确认提交订单',
      content: `确定为供应商 ${selectedQuote.supplier_name} 提交采购订单吗？提交后需要审核通过才能正式下单。`,
      onOk: async () => {
        try {
          await PurchaseAPI.generateOrder(purchase.id);
          message.success('订单提交成功，待审核');
          // 跳转回详情页面
          history.push(`/purchase/${purchase.id}`);
        } catch (error) {
          message.error('订单提交失败');
        }
      },
    });
  };

  // 跳转到供应商报价页面
  const goToSupplierQuote = (
    supplierId: string,
    mode: 'view' | 'edit' = 'view',
  ) => {
    if (!purchase) return;
    const url = `/purchase/${purchase.id}/supplier-quote?supplier=${supplierId}&mode=${mode}`;
    window.open(url, '_blank');
  };

  // 供应商列表表格列
  const supplierColumns = [
    {
      title: '供应商名称',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: '报价状态',
      key: 'status',
      render: (_: any, record: QuoteItem) => {
        const colors = {
          pending: 'default',
          quoted: 'success',
          selected: 'processing',
        };
        const texts = {
          pending: '未报价',
          quoted: '已报价',
          selected: '已选中',
        };
        return <Tag color={colors[record.status]}>{texts[record.status]}</Tag>;
      },
    },
    {
      title: '报价总额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => (amount > 0 ? `¥${amount.toFixed(2)}` : '-'),
    },
    {
      title: '报价时间',
      dataIndex: 'quote_date',
      key: 'quote_date',
      render: (date: string) => date || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: QuoteItem) => (
        <Space>
          {record.status === 'pending' && (
            <Tag color="default">等待供应商报价</Tag>
          )}
          {record.status === 'quoted' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => goToSupplierQuote(record.supplier_id, 'view')}
              >
                查看报价
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleSelectSupplier(record)}
              >
                选择
              </Button>
            </>
          )}
          {record.status === 'selected' && <Tag color="success">已选中</Tag>}
        </Space>
      ),
    },
  ];

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!purchase) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="采购单不存在"
        extra={
          <Button type="primary" onClick={() => history.push('/purchase')}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        {/* 头部操作栏 */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
              返回详情
            </Button>
            <Divider type="vertical" />
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>
              询价管理 - {purchase.purchase_no}
            </span>
            <Tag color={purchase.status.code === 5 ? 'warning' : 'success'}>
              {purchase.status.name}
            </Tag>
          </Space>
          <div style={{ float: 'right' }}>
            <Space>
              {purchase.status.code === 5 && ( // 待询价状态显示供应商门户
                <Button
                  onClick={() => window.open('/supplier-portal', '_blank')}
                >
                  供应商门户
                </Button>
              )}
              {quotes.some((q) => q.status === 'selected') && (
                <Button type="primary" onClick={handleGenerateOrder}>
                  提交订单
                </Button>
              )}
              {purchase.status.code === 6 &&
                !quotes.some((q) => q.status === 'selected') && ( // 已报价但未选择供应商
                  <Button type="primary" disabled>
                    请先选择供应商
                  </Button>
                )}
            </Space>
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        {/* 操作指引 */}
        <Alert
          message={purchase.status.code === 5 ? '询价流程指引' : '报价选择指引'}
          description={
            <div>
              {purchase.status.code === 5 ? (
                // 待询价状态的指引
                <>
                  <p>
                    <strong>{`当采购单处于"待询价"状态时，您需要：`}</strong>
                  </p>
                  <ol>
                    <li>
                      <strong>通知供应商：</strong>{' '}
                      {`点击右上角"供应商门户"按钮，将链接发送给供应商`}
                    </li>
                    <li>
                      <strong>等待报价：</strong>{' '}
                      供应商会在门户中看到此询价单，并
                      <strong>独立填写报价信息</strong>（采购人员无法代填）
                    </li>
                    <li>
                      <strong>监控进度：</strong>{' '}
                      在下方表格中查看各供应商的报价状态
                    </li>
                    <li>
                      <strong>比价选择：</strong>{' '}
                      所有供应商报价后，对比价格和条件，选择最优供应商
                    </li>
                  </ol>
                  <p>
                    <strong>供应商门户链接：</strong>{' '}
                    <code>{window.location.origin}/supplier-portal</code>
                  </p>
                  <p style={{ color: '#ff4d4f', marginTop: 8 }}>
                    <strong>⚠️ 注意：</strong>{' '}
                    报价必须由供应商在供应商门户中填写，采购人员不能代为填写，以确保报价的独立性和公正性。
                  </p>
                </>
              ) : (
                // 已报价状态的指引
                <>
                  <p>
                    <strong>{`当采购单处于"已报价"状态时，您需要：`}</strong>
                  </p>
                  <ol>
                    <li>
                      <strong>对比报价：</strong>{' '}
                      {`在下方表格中查看各供应商的报价详情`}
                    </li>
                    <li>
                      <strong>选择供应商：</strong>{' '}
                      {`根据价格、交货期等因素，点击"选择"按钮选择最优供应商`}
                    </li>
                    <li>
                      <strong>提交订单：</strong>{' '}
                      {`选择供应商后，点击右上角"提交订单"按钮，提交后需审核通过才能正式下单`}
                    </li>
                  </ol>
                  <p>
                    <strong>注意：</strong>{' '}
                    选择供应商后将无法更改，请仔细对比后再做决定。
                  </p>
                </>
              )}
            </div>
          }
          type="info"
          style={{ marginBottom: 24 }}
          showIcon
        />

        <Row gutter={[24, 24]}>
          {/* 采购单基本信息 */}
          <Col span={24}>
            <Card title="采购单信息" size="small">
              <Descriptions column={4} bordered>
                <Descriptions.Item label="采购单号">
                  {purchase.purchase_no}
                </Descriptions.Item>
                <Descriptions.Item label="采购门店">
                  {purchase.store_name}
                </Descriptions.Item>
                <Descriptions.Item label="采购人">
                  {purchase.creator_name}
                </Descriptions.Item>
                <Descriptions.Item label="期望到货日期">
                  {purchase.expected_delivery_date}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* 配件清单 */}
          <Col span={24}>
            <Card title="配件清单" size="small">
              <Table
                columns={[
                  {
                    title: '配件编码',
                    dataIndex: 'part_code',
                    key: 'part_code',
                  },
                  {
                    title: '配件名称',
                    dataIndex: 'part_name',
                    key: 'part_name',
                  },
                  {
                    title: '规格型号',
                    dataIndex: 'specification',
                    key: 'specification',
                  },
                  { title: '采购数量', dataIndex: 'quantity', key: 'quantity' },
                  { title: '单位', dataIndex: 'unit', key: 'unit' },
                  {
                    title: '历史均价',
                    dataIndex: 'historical_avg_price',
                    key: 'historical_avg_price',
                    render: (price: number) =>
                      price ? `¥${price.toFixed(2)}` : '-',
                  },
                ]}
                dataSource={purchase.purchase_details}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          {/* 供应商报价情况 */}
          <Col span={24}>
            <Card title="供应商报价情况" size="small">
              <Table
                columns={supplierColumns}
                dataSource={quotes}
                rowKey="supplier_id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InquiryPage;
