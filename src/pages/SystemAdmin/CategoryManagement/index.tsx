import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tree,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

// 品类节点类型
interface CategoryNode {
  id: string;
  name: string;
  parent_id: string | null;
  level: number;
  type: 'PARTS' | 'ACCESSORIES'; // 备件或精品
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
  children?: CategoryNode[];
}

const CategoryManagement: React.FC = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const mockCategories: CategoryNode[] = [
    {
      id: '1',
      name: '备件',
      parent_id: null,
      level: 1,
      type: 'PARTS',
      sort_order: 1,
      status: 'ACTIVE',
      children: [
        {
          id: '1-1',
          name: '发动机系统',
          parent_id: '1',
          level: 2,
          type: 'PARTS',
          sort_order: 1,
          status: 'ACTIVE',
          children: [
            {
              id: '1-1-1',
              name: '机油滤清器',
              parent_id: '1-1',
              level: 3,
              type: 'PARTS',
              sort_order: 1,
              status: 'ACTIVE',
            },
            {
              id: '1-1-2',
              name: '空气滤清器',
              parent_id: '1-1',
              level: 3,
              type: 'PARTS',
              sort_order: 2,
              status: 'ACTIVE',
            },
          ],
        },
        {
          id: '1-2',
          name: '制动系统',
          parent_id: '1',
          level: 2,
          type: 'PARTS',
          sort_order: 2,
          status: 'ACTIVE',
          children: [
            {
              id: '1-2-1',
              name: '刹车片',
              parent_id: '1-2',
              level: 3,
              type: 'PARTS',
              sort_order: 1,
              status: 'ACTIVE',
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: '精品',
      parent_id: null,
      level: 1,
      type: 'ACCESSORIES',
      sort_order: 2,
      status: 'ACTIVE',
      children: [
        {
          id: '2-1',
          name: '车内饰品',
          parent_id: '2',
          level: 2,
          type: 'ACCESSORIES',
          sort_order: 1,
          status: 'ACTIVE',
          children: [
            {
              id: '2-1-1',
              name: '脚垫系列',
              parent_id: '2-1',
              level: 3,
              type: 'ACCESSORIES',
              sort_order: 1,
              status: 'ACTIVE',
            },
          ],
        },
      ],
    },
  ];

  // 转换为 Tree 组件需要的数据格式
  const convertToTreeData = (categories: CategoryNode[]): DataNode[] => {
    return categories.map((cat) => ({
      key: cat.id,
      title: (
        <span>
          <FolderOutlined
            style={{
              marginRight: 8,
              color: cat.type === 'PARTS' ? '#1890ff' : '#52c41a',
            }}
          />
          {cat.name}
          {cat.status === 'INACTIVE' && (
            <span style={{ color: '#999', marginLeft: 8 }}>(已停用)</span>
          )}
        </span>
      ),
      children: cat.children ? convertToTreeData(cat.children) : undefined,
      isLeaf: !cat.children || cat.children.length === 0,
    }));
  };

  // 查找节点
  const findNode = (
    categories: CategoryNode[],
    id: string,
  ): CategoryNode | null => {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findNode(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    // 加载品类树数据
    setTreeData(convertToTreeData(mockCategories));
  }, []);

  // 选择节点
  const handleSelect = (selectedKeys: React.Key[]) => {
    setSelectedKeys(selectedKeys);
    if (selectedKeys.length > 0) {
      const node = findNode(mockCategories, selectedKeys[0] as string);
      setSelectedCategory(node);
    } else {
      setSelectedCategory(null);
    }
  };

  // 添加子分类
  const handleAdd = () => {
    if (!selectedCategory) {
      message.warning('请先选择一个父级分类');
      return;
    }
    if (selectedCategory.level >= 3) {
      message.warning('品类树最多支持3级');
      return;
    }
    setModalMode('add');
    form.resetFields();
    form.setFieldsValue({
      parent_id: selectedCategory.id,
      type: selectedCategory.type,
      status: 'ACTIVE',
    });
    setModalVisible(true);
  };

  // 编辑分类
  const handleEdit = () => {
    if (!selectedCategory) {
      message.warning('请先选择一个分类');
      return;
    }
    setModalMode('edit');
    form.setFieldsValue(selectedCategory);
    setModalVisible(true);
  };

  // 删除分类
  const handleDelete = async () => {
    if (!selectedCategory) {
      message.warning('请先选择一个分类');
      return;
    }
    if (selectedCategory.children && selectedCategory.children.length > 0) {
      message.error('该分类下还有子分类，无法删除');
      return;
    }

    try {
      setLoading(true);
      // TODO: 调用API删除
      message.success('删除成功');
      setSelectedKeys([]);
      setSelectedCategory(null);
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="品类树管理"
      extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加子分类
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            disabled={!selectedCategory}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该分类吗？"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedCategory}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Row gutter={24}>
        <Col span={10}>
          <div
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 4,
              padding: 16,
              maxHeight: 'calc(100vh - 300px)',
              overflow: 'auto',
            }}
          >
            <Tree
              showLine
              showIcon
              defaultExpandAll
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              treeData={treeData}
            />
          </div>
        </Col>
        <Col span={14}>
          {selectedCategory ? (
            <Card title="分类详情" size="small">
              <div style={{ lineHeight: 2.5 }}>
                <div>
                  <strong>分类名称：</strong>
                  {selectedCategory.name}
                </div>
                <div>
                  <strong>分类类型：</strong>
                  {selectedCategory.type === 'PARTS' ? (
                    <span style={{ color: '#1890ff' }}>备件</span>
                  ) : (
                    <span style={{ color: '#52c41a' }}>精品</span>
                  )}
                </div>
                <div>
                  <strong>层级：</strong>第 {selectedCategory.level} 级
                </div>
                <div>
                  <strong>排序：</strong>
                  {selectedCategory.sort_order}
                </div>
                <div>
                  <strong>状态：</strong>
                  {selectedCategory.status === 'ACTIVE' ? (
                    <span style={{ color: '#52c41a' }}>启用</span>
                  ) : (
                    <span style={{ color: '#999' }}>停用</span>
                  )}
                </div>
                <div>
                  <strong>子分类数量：</strong>
                  {selectedCategory.children?.length || 0}
                </div>
              </div>
            </Card>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 60,
                color: '#999',
                border: '1px solid #f0f0f0',
                borderRadius: 4,
              }}
            >
              <FolderOpenOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>请在左侧选择一个分类查看详情</div>
            </div>
          )}
        </Col>
      </Row>

      <Modal
        title={modalMode === 'add' ? '添加子分类' : '编辑分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parent_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            label="分类类型"
            name="type"
            rules={[{ required: true, message: '请选择分类类型' }]}
          >
            <Select disabled={modalMode === 'add'}>
              <Option value="PARTS">备件</Option>
              <Option value="ACCESSORIES">精品</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="排序序号"
            name="sort_order"
            rules={[{ required: true, message: '请输入排序序号' }]}
            initialValue={1}
          >
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
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

export default CategoryManagement;
