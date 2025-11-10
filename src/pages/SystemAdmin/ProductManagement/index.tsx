import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Cascader,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Option } = Select;
const { TextArea } = Input;

// 产品信息类型
interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category_path: string[]; // 品类路径
  category_name: string; // 品类名称（显示用）
  type: 'PARTS' | 'ACCESSORIES';
  unit: string;
  description: string;
  sales_attributes: SalesAttribute[]; // 销售属性配置
  sku_count: number; // 关联的SKU数量
  status: 'ACTIVE' | 'INACTIVE';
  create_time: string;
}

// 销售属性定义
interface SalesAttribute {
  attr_name: string; // 属性名称，如"颜色"、"品牌"
  attr_code: string; // 属性编码
  attr_values: string[]; // 属性值列表，如["红色", "黑色"]
  is_multiple: boolean; // 是否多选（适用车型可多选）
  is_required: boolean; // 是否必选
}

const ProductManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form] = Form.useForm();

  // 模拟数据
  const mockProducts: Product[] = [
    {
      id: '1',
      product_code: 'P20241015001',
      product_name: '机油滤清器',
      category_path: ['1', '1-1', '1-1-1'],
      category_name: '备件 > 发动机系统 > 机油滤清器',
      type: 'PARTS',
      unit: '个',
      description: '适用于多种车型的标准机油滤清器',
      sales_attributes: [
        {
          attr_name: '品牌',
          attr_code: 'brand',
          attr_values: ['博世', '曼牌', '马勒'],
          is_multiple: false,
          is_required: true,
        },
        {
          attr_name: '适用车型',
          attr_code: 'vehicle_model',
          attr_values: ['宝马3系', '宝马5系', '奔驰C级'],
          is_multiple: true,
          is_required: true,
        },
      ],
      sku_count: 9,
      status: 'ACTIVE',
      create_time: '2024-10-15 10:00:00',
    },
    {
      id: '2',
      product_code: 'P20241015002',
      product_name: '全包围脚垫',
      category_path: ['2', '2-1', '2-1-1'],
      category_name: '精品 > 车内饰品 > 脚垫系列',
      type: 'ACCESSORIES',
      unit: '套',
      description: '高档皮革全包围脚垫',
      sales_attributes: [
        {
          attr_name: '颜色',
          attr_code: 'color',
          attr_values: ['黑色', '米色', '棕色'],
          is_multiple: false,
          is_required: true,
        },
        {
          attr_name: '材质',
          attr_code: 'material',
          attr_values: ['真皮', '仿皮', '丝圈'],
          is_multiple: false,
          is_required: true,
        },
      ],
      sku_count: 9,
      status: 'ACTIVE',
      create_time: '2024-10-15 11:00:00',
    },
  ];

  const [dataSource, setDataSource] = useState<Product[]>(mockProducts);

  // 添加产品
  const handleAdd = () => {
    setModalMode('add');
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑产品
  const handleEdit = (record: Product) => {
    setModalMode('edit');
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除产品
  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除产品"${record.product_name}"吗？删除后该产品下的所有SKU也将被删除。`,
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

  // 管理SKU
  const handleManageSKU = (record: Product) => {
    message.info(`跳转到SKU管理页面：${record.product_name}`);
    // TODO: 跳转到SKU管理页面
  };

  // 表格列定义
  const columns: ColumnsType<Product> = [
    {
      title: '产品编码',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 150,
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
    },
    {
      title: '所属品类',
      dataIndex: 'category_name',
      key: 'category_name',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) =>
        type === 'PARTS' ? (
          <Tag color="blue">备件</Tag>
        ) : (
          <Tag color="green">精品</Tag>
        ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '销售属性',
      key: 'sales_attributes',
      width: 200,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.sales_attributes.map((attr) => (
            <Tag key={attr.attr_code}>{attr.attr_name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'SKU数量',
      dataIndex: 'sku_count',
      key: 'sku_count',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<AppstoreOutlined />}
            onClick={() => handleManageSKU(record)}
          >
            管理SKU
          </Button>
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

  // 提交表单
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      // TODO: 调用API保存
      if (modalMode === 'add') {
        message.success('添加成功');
      } else {
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 品类树级联选择器选项（模拟数据）
  const categoryOptions = [
    {
      value: '1',
      label: '备件',
      children: [
        {
          value: '1-1',
          label: '发动机系统',
          children: [
            { value: '1-1-1', label: '机油滤清器' },
            { value: '1-1-2', label: '空气滤清器' },
          ],
        },
        {
          value: '1-2',
          label: '制动系统',
          children: [{ value: '1-2-1', label: '刹车片' }],
        },
      ],
    },
    {
      value: '2',
      label: '精品',
      children: [
        {
          value: '2-1',
          label: '车内饰品',
          children: [{ value: '2-1-1', label: '脚垫系列' }],
        },
      ],
    },
  ];

  return (
    <Card
      title={
        <Space>
          <AppstoreOutlined />
          <span>产品管理</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建产品
        </Button>
      }
    >
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1400 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={modalMode === 'add' ? '新建产品' : '编辑产品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品名称"
                name="product_name"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="所属品类"
                name="category_path"
                rules={[{ required: true, message: '请选择所属品类' }]}
              >
                <Cascader
                  options={categoryOptions}
                  placeholder="请选择品类"
                  changeOnSelect
                  displayRender={(labels) => labels.join(' > ')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品编码"
                name="product_code"
                tooltip="留空则自动生成"
              >
                <Input
                  placeholder="留空自动生成"
                  disabled={modalMode === 'edit'}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="单位"
                name="unit"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="如：个、套、升" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="产品描述" name="description">
            <TextArea rows={3} placeholder="请输入产品描述" />
          </Form.Item>

          <Divider>销售属性配置</Divider>

          <div style={{ padding: 16, background: '#fafafa', borderRadius: 4 }}>
            <p style={{ color: '#666', marginBottom: 12 }}>
              销售属性用于生成SKU，每个属性值的组合将生成一个独立的SKU。
              <br />
              例如：品牌(博世/曼牌) × 适用车型(宝马3系/宝马5系) = 4个SKU
            </p>
            {/* TODO: 动态添加销售属性表单 */}
            <Button type="dashed" icon={<PlusOutlined />} block>
              添加销售属性
            </Button>
          </div>

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

export default ProductManagement;
