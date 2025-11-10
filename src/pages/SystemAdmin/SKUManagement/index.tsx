import {
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';

const { Option } = Select;
const { TextArea } = Input;

// SKU资源类型
interface SKU {
  id: string;
  sku_code: string;
  sku_name: string;
  product_id: string;
  product_name: string;
  category_type: 'PARTS' | 'ACCESSORIES';
  // 销售属性值
  attributes: Record<string, string>; // 如 { brand: '博世', vehicle_model: '宝马3系' }
  // 备件专有字段
  oem_number?: string;
  // 精品专有字段
  supplier_id?: string;
  supplier_name?: string;
  fixed_price?: number;
  stock_status?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  min_order_quantity?: number;
  // 通用字段
  specification: string;
  unit: string;
  historical_avg_price?: number;
  images: string[];
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  create_time: string;
}

const SKUManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [, setSelectedSKU] = useState<SKU | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 模拟数据
  const mockSKUs: SKU[] = [
    {
      id: '1',
      sku_code: 'SKU20241015001',
      sku_name: '博世机油滤清器-适用宝马3系',
      product_id: 'P1',
      product_name: '机油滤清器',
      category_type: 'PARTS',
      attributes: {
        brand: '博世',
        vehicle_model: '宝马3系',
      },
      oem_number: '11427634291',
      specification: 'OC90',
      unit: '个',
      historical_avg_price: 45.0,
      images: [],
      description: '博世原厂品质机油滤清器',
      status: 'ACTIVE',
      create_time: '2024-10-15 10:00:00',
    },
    {
      id: '2',
      sku_code: 'SKU20241015002',
      sku_name: '全包围脚垫-黑色真皮',
      product_id: 'P2',
      product_name: '全包围脚垫',
      category_type: 'ACCESSORIES',
      attributes: {
        color: '黑色',
        material: '真皮',
      },
      supplier_id: 'SUP001',
      supplier_name: '精品供应商A',
      fixed_price: 299.0,
      stock_status: 'IN_STOCK',
      min_order_quantity: 1,
      specification: '全包围',
      unit: '套',
      images: [],
      description: '高档真皮全包围脚垫，完美贴合',
      status: 'ACTIVE',
      create_time: '2024-10-15 11:00:00',
    },
  ];

  const [dataSource, setDataSource] = useState<SKU[]>(mockSKUs);

  // 编辑SKU
  const handleEdit = (record: SKU) => {
    setModalMode('edit');
    setSelectedSKU(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除SKU
  const handleDelete = (record: SKU) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除SKU"${record.sku_name}"吗？`,
      onOk: async () => {
        try {
          setLoading(true);
          // TODO: 调用API删除
          message.success('删除成功');
          setDataSource(dataSource.filter((item) => item.id !== record.id));
        } catch (error) {
          message.error('删除失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };
  // 表格列定义
  const columns: ColumnsType<SKU> = [
    {
      title: 'SKU编码',
      dataIndex: 'sku_code',
      key: 'sku_code',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'SKU名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 250,
      fixed: 'left',
    },
    {
      title: '所属产品',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'category_type',
      key: 'category_type',
      width: 80,
      render: (type: string) =>
        type === 'PARTS' ? (
          <Tag color="blue">备件</Tag>
        ) : (
          <Tag color="green">精品</Tag>
        ),
    },
    {
      title: '销售属性',
      key: 'attributes',
      width: 200,
      render: (_, record) => (
        <Space size="small" direction="vertical">
          {Object.entries(record.attributes).map(([key, value]) => (
            <Tag key={key}>
              {key}: {value}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '价格信息',
      key: 'price',
      width: 120,
      render: (_, record) => {
        if (record.category_type === 'PARTS') {
          return (
            <div>
              <div style={{ fontSize: 12, color: '#999' }}>历史均价</div>
              <div>¥{record.historical_avg_price?.toFixed(2)}</div>
            </div>
          );
        } else {
          return (
            <div>
              <div style={{ fontSize: 12, color: '#999' }}>固定价格</div>
              <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                ¥{record.fixed_price?.toFixed(2)}
              </div>
            </div>
          );
        }
      },
    },
    {
      title: '供应商',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '库存状态',
      dataIndex: 'stock_status',
      key: 'stock_status',
      width: 100,
      render: (status) => {
        if (!status) return '-';
        const statusMap = {
          IN_STOCK: { text: '有库存', color: 'success' },
          OUT_OF_STOCK: { text: '缺货', color: 'warning' },
          DISCONTINUED: { text: '停产', color: 'default' },
        };
        const { text, color } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) =>
        status === 'ACTIVE' ? (
          <Tag color="success">启用</Tag>
        ) : (
          <Tag color="default">停用</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 添加SKU
  const handleAdd = () => {
    setModalMode('add');
    setSelectedSKU(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // TODO: 调用API保存
      if (modalMode === 'add') {
        message.success('添加成功');
      } else {
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const categoryType = Form.useWatch('category_type', form);

  return (
    <Card
      title={
        <Space>
          <PictureOutlined />
          <span>SKU资源管理</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建SKU
        </Button>
      }
    >
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1800 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={modalMode === 'add' ? '新建SKU' : '编辑SKU'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        confirmLoading={loading}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="SKU名称"
                name="sku_name"
                rules={[{ required: true, message: '请输入SKU名称' }]}
              >
                <Input placeholder="请输入SKU名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="所属产品"
                name="product_id"
                rules={[{ required: true, message: '请选择所属产品' }]}
              >
                <Select placeholder="请选择产品">
                  <Option value="P1">机油滤清器</Option>
                  <Option value="P2">全包围脚垫</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="SKU编码"
                name="sku_code"
                tooltip="留空则自动生成"
              >
                <Input
                  placeholder="留空自动生成"
                  disabled={modalMode === 'edit'}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="类型"
                name="category_type"
                rules={[{ required: true }]}
              >
                <Select placeholder="选择类型">
                  <Option value="PARTS">备件</Option>
                  <Option value="ACCESSORIES">精品</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="单位"
                name="unit"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="如：个、套" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>销售属性</Divider>
          <div
            style={{
              background: '#fafafa',
              padding: 16,
              marginBottom: 16,
              borderRadius: 4,
            }}
          >
            {/* TODO: 根据产品的销售属性配置动态渲染表单项 */}
            <p style={{ color: '#999' }}>根据所选产品自动展示销售属性选择</p>
          </div>

          {categoryType === 'PARTS' && (
            <>
              <Divider>备件专属信息</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="原厂件号" name="oem_number">
                    <Input placeholder="请输入原厂件号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="历史平均价格" name="historical_avg_price">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="系统自动计算"
                      prefix="¥"
                      precision={2}
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {categoryType === 'ACCESSORIES' && (
            <>
              <Divider>精品专属信息</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="供应商"
                    name="supplier_id"
                    rules={[{ required: true, message: '请选择供应商' }]}
                  >
                    <Select placeholder="请选择供应商">
                      <Option value="SUP001">精品供应商A</Option>
                      <Option value="SUP002">精品供应商B</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="固定价格"
                    name="fixed_price"
                    rules={[{ required: true, message: '请输入固定价格' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="请输入价格"
                      prefix="¥"
                      precision={2}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="库存状态" name="stock_status">
                    <Select placeholder="请选择库存状态">
                      <Option value="IN_STOCK">有库存</Option>
                      <Option value="OUT_OF_STOCK">缺货</Option>
                      <Option value="DISCONTINUED">停产</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="最小起订量" name="min_order_quantity">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="请输入最小起订量"
                      min={1}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Form.Item label="规格型号" name="specification">
            <Input placeholder="请输入规格型号" />
          </Form.Item>

          <Form.Item label="SKU描述" name="description">
            <TextArea rows={3} placeholder="请输入SKU描述" />
          </Form.Item>

          <Form.Item label="商品图片" name="images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
            >
              {fileList.length < 5 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true }]}
            initialValue="ACTIVE"
          >
            <Select>
              <Option value="ACTIVE">启用</Option>
              <Option value="INACTIVE">停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SKUManagement;
