import {
  COMMON_CATEGORY_STATUS,
  COMMON_CATEGORY_STATUS_CODE,
} from '@/constants';
import { CategoryAPI } from '@/services/system/category/CategoryController';
import type { CategoryInfo } from '@/services/system/category/typing';
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
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
  Space,
  Spin,
  Tree,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useState } from 'react';

// 品类节点类型（扩展 CategoryInfo）
interface CategoryNode extends CategoryInfo {
  children?: CategoryNode[];
  _loaded?: boolean; // 标记是否已加载子节点
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
  const [treeLoading, setTreeLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);

  // 加载子节点（获取所有状态的节点）
  const loadChildren = async (
    parentId: number | null | undefined,
  ): Promise<CategoryNode[]> => {
    try {
      // 不传 status 参数，获取所有状态的节点
      const response = await CategoryAPI.getChildren({
        parent_id: parentId ? parentId : 0,
      });
      return (response.data.categories || []).map((cat) => ({
        ...cat,
        children: [],
        _loaded: false,
      }));
    } catch (error) {
      console.error('加载子节点失败:', error);
      message.error('加载子节点失败');
      return [];
    }
  };

  // 转换为 Tree 组件需要的数据格式
  const convertToTreeData = (categories: CategoryNode[]): DataNode[] => {
    return categories.map((cat) => ({
      key: cat.id ? String(cat.id) : '',
      title: (
        <span>
          <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {cat.name}
          {cat.status?.code === COMMON_CATEGORY_STATUS_CODE.DISABLED && (
            <span style={{ color: '#999', marginLeft: 8 }}>(已停用)</span>
          )}
        </span>
      ),
      children: cat.children ? convertToTreeData(cat.children) : undefined,
      // 根据 has_children 判断是否为叶子节点
      isLeaf: !cat.has_children,
    }));
  };

  // 查找节点
  const findNode = (
    categories: CategoryNode[],
    id: string,
  ): CategoryNode | null => {
    for (const cat of categories) {
      if (cat.id && String(cat.id) === id) return cat;
      if (cat.children) {
        const found = findNode(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 收集所有已加载的节点ID（有子节点的节点）
  const collectLoadedNodeIds = (nodes: CategoryNode[]): Set<number> => {
    const ids = new Set<number>();
    const traverse = (nodeList: CategoryNode[]) => {
      nodeList.forEach((node) => {
        if (node.children && node.children.length > 0) {
          if (node.id) {
            ids.add(node.id);
          }
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return ids;
  };

  // 递归刷新节点及其所有已加载的子节点
  const refreshNodeRecursively = async (
    node: CategoryNode,
    loadedIds: Set<number>,
  ): Promise<CategoryNode> => {
    // 如果这个节点已加载过子节点，重新加载其子节点
    if (node.id && loadedIds.has(node.id)) {
      const latestChildren = await loadChildren(node.id);
      // 递归刷新子节点
      const refreshedChildren = await Promise.all(
        latestChildren.map((child) => refreshNodeRecursively(child, loadedIds)),
      );
      return {
        ...node,
        children: refreshedChildren,
      };
    }
    return node;
  };

  // 刷新树数据（刷新所有已加载的节点）
  const refreshTree = async () => {
    setTreeLoading(true);
    try {
      // 收集所有已加载的节点ID
      const loadedIds = collectLoadedNodeIds(categories);

      // 先刷新根节点
      const rootCategories = await loadChildren(0);

      // 递归刷新所有已加载的节点
      const refreshedCategories = await Promise.all(
        rootCategories.map((cat) => refreshNodeRecursively(cat, loadedIds)),
      );

      setCategories(refreshedCategories);
      setTreeData(convertToTreeData(refreshedCategories));
    } catch (error) {
      console.error('加载品类树失败:', error);
      message.error('加载品类树失败');
    } finally {
      setTreeLoading(false);
    }
  };

  // 懒加载子节点（当展开节点时调用）
  const onLoadData = async (node: any) => {
    const { key, children } = node;

    // 如果已经有子节点数据，不再加载
    if (children && children.length > 0) {
      return Promise.resolve();
    }

    try {
      // 加载该节点的子节点
      const childNodes = await loadChildren(Number(key));

      // 更新树数据
      const updateTreeData = (list: DataNode[]): DataNode[] => {
        return list.map((item) => {
          if (item.key === key) {
            return {
              ...item,
              children: convertToTreeData(childNodes),
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateTreeData(item.children),
            };
          }
          return item;
        });
      };

      setTreeData((prevTreeData) => updateTreeData(prevTreeData));

      // 更新 categories 状态，方便查找节点
      const updateCategories = (
        list: CategoryNode[],
        parentId: number,
      ): CategoryNode[] => {
        return list.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: childNodes,
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateCategories(item.children, parentId),
            };
          }
          return item;
        });
      };

      setCategories((prevCategories) =>
        updateCategories(prevCategories, Number(key)),
      );
    } catch (error) {
      console.error('加载子节点失败:', error);
      message.error('加载子节点失败');
    }
  };

  useEffect(() => {
    refreshTree();
  }, []);

  // 选择节点
  const handleSelect = (selectedKeys: React.Key[]) => {
    setSelectedKeys(selectedKeys);
    if (selectedKeys.length > 0) {
      const node = findNode(categories, selectedKeys[0] as string);
      setSelectedCategory(node);
    } else {
      setSelectedCategory(null);
    }
  };

  // 添加子分类
  const handleAdd = () => {
    // 如果没有选择分类，则添加根节点分类
    if (!selectedCategory) {
      setModalMode('add');
      form.resetFields();
      form.setFieldsValue({
        parent_id: 0, // 根节点的 parent_id 为 0
      });
      setModalVisible(true);
      return;
    }

    // 如果选择了分类，检查层级限制
    const level = parseInt(selectedCategory.level || '1', 10);
    if (level >= 3) {
      message.warning('品类树最多支持3级');
      return;
    }
    setModalMode('add');
    form.resetFields();
    form.setFieldsValue({
      parent_id: selectedCategory.id ? selectedCategory.id : 0,
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
    form.setFieldsValue({
      name: selectedCategory.name,
      parent_id: selectedCategory.parent_id ? selectedCategory.parent_id : 0,
    });
    setModalVisible(true);
  };

  // 修改状态
  const handleChangeStatus = async () => {
    if (!selectedCategory || !selectedCategory.id) {
      message.warning('请先选择一个分类');
      return;
    }

    const currentStatus = selectedCategory.status?.code;
    const newStatus =
      currentStatus === COMMON_CATEGORY_STATUS_CODE.ACTIVE
        ? COMMON_CATEGORY_STATUS.DISABLED
        : COMMON_CATEGORY_STATUS.ACTIVE;
    const selectedId = selectedCategory.id;

    try {
      setLoading(true);
      await CategoryAPI.updateCategoryStatus({
        category_id: selectedId,
        status: newStatus,
      });
      message.success(
        newStatus === COMMON_CATEGORY_STATUS.ACTIVE ? '已启用' : '已停用',
      );
      // 刷新当前节点所在层的数据
      const parentId = selectedCategory.parent_id
        ? Number(selectedCategory.parent_id)
        : 0;
      const siblings = await loadChildren(parentId);

      // 更新树数据
      const updateTreeData = (list: DataNode[]): DataNode[] => {
        return list.map((item) => {
          if (item.key === String(selectedId)) {
            // 找到当前节点，更新其状态显示
            const updatedCat = siblings.find((c) => c.id === selectedId);
            if (updatedCat) {
              return {
                ...item,
                title: (
                  <span>
                    <FolderOutlined
                      style={{ marginRight: 8, color: '#1890ff' }}
                    />
                    {updatedCat.name}
                    {updatedCat.status?.code ===
                      COMMON_CATEGORY_STATUS_CODE.DISABLED && (
                      <span style={{ color: '#999', marginLeft: 8 }}>
                        (已停用)
                      </span>
                    )}
                  </span>
                ),
              };
            }
          }
          if (item.children) {
            return {
              ...item,
              children: updateTreeData(item.children),
            };
          }
          return item;
        });
      };

      // 如果是根节点，直接更新整个树
      if (parentId === 0) {
        setCategories(siblings);
        setTreeData(convertToTreeData(siblings));
      } else {
        setTreeData((prevTreeData) => updateTreeData(prevTreeData));
        // 更新 categories
        const updateCategories = (
          list: CategoryNode[],
          pid: number,
        ): CategoryNode[] => {
          return list.map((item) => {
            if (item.id === pid) {
              return {
                ...item,
                children: siblings,
              };
            }
            if (item.children) {
              return {
                ...item,
                children: updateCategories(item.children, pid),
              };
            }
            return item;
          });
        };
        setCategories((prevCategories) =>
          updateCategories(prevCategories, parentId),
        );
      }

      // 刷新后重新选中当前节点
      const updatedNode = siblings.find((c) => c.id === selectedId);
      if (updatedNode) {
        setSelectedCategory(updatedNode);
        setSelectedKeys([String(selectedId)]);
      }
    } catch (error) {
      console.error('修改状态失败:', error);
      message.error('修改状态失败');
    } finally {
      setLoading(false);
    }
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
    if (!selectedCategory.id) {
      message.error('分类ID不存在');
      return;
    }

    try {
      setLoading(true);
      await CategoryAPI.deleteCategory(selectedCategory.id);
      message.success('删除成功');
      setSelectedKeys([]);
      setSelectedCategory(null);
      await refreshTree();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const values = form.getFieldsValue();
      let parentId: number;

      if (modalMode === 'add') {
        parentId = values.parent_id || 0;
        await CategoryAPI.createCategory({
          name: values.name,
          parent_id: parentId,
        });
        message.success('添加成功，新分类默认为关闭状态，请手动启用');
      } else {
        if (!selectedCategory) {
          message.error('未选择分类');
          return;
        }
        // 更新时保持原有的 parent_id
        if (!selectedCategory.id) {
          message.error('分类ID不存在');
          return;
        }
        parentId = selectedCategory.parent_id
          ? Number(selectedCategory.parent_id)
          : 0;
        await CategoryAPI.updateCategory({
          category_id: selectedCategory.id,
          name: values.name,
        });
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();

      // 刷新对应父节点所在层的数据
      const siblings = await loadChildren(parentId);

      // 如果是根节点，直接更新整个树
      if (parentId === 0) {
        setCategories(siblings);
        setTreeData(convertToTreeData(siblings));
      } else {
        // 更新树数据：找到父节点，更新其子节点
        const updateTreeData = (list: DataNode[]): DataNode[] => {
          return list.map((item) => {
            if (item.key === String(parentId)) {
              // 找到父节点，更新其子节点
              return {
                ...item,
                children: convertToTreeData(siblings),
              };
            }
            if (item.children) {
              return {
                ...item,
                children: updateTreeData(item.children),
              };
            }
            return item;
          });
        };
        setTreeData((prevTreeData) => updateTreeData(prevTreeData));

        // 更新 categories
        const updateCategories = (
          list: CategoryNode[],
          pid: number,
        ): CategoryNode[] => {
          return list.map((item) => {
            if (item.id === pid) {
              return {
                ...item,
                children: siblings,
              };
            }
            if (item.children) {
              return {
                ...item,
                children: updateCategories(item.children, pid),
              };
            }
            return item;
          });
        };
        setCategories((prevCategories) =>
          updateCategories(prevCategories, parentId),
        );
      }
    } catch (error: any) {
      console.error('操作失败:', error);
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card
        title="品类树管理"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshTree}
              loading={treeLoading}
            >
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {selectedCategory ? '添加子分类' : '添加分类'}
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={handleEdit}
              disabled={!selectedCategory}
            >
              编辑
            </Button>
            <Button
              onClick={handleChangeStatus}
              disabled={!selectedCategory}
              type={
                selectedCategory?.status?.code ===
                COMMON_CATEGORY_STATUS_CODE.ACTIVE
                  ? 'default'
                  : 'primary'
              }
            >
              {selectedCategory?.status?.code ===
              COMMON_CATEGORY_STATUS_CODE.ACTIVE
                ? '停用'
                : '启用'}
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
            <Spin spinning={treeLoading}>
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
                  selectedKeys={selectedKeys}
                  onSelect={handleSelect}
                  treeData={treeData}
                  loadData={onLoadData}
                />
              </div>
            </Spin>
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
                    <strong>分类ID：</strong>
                    {selectedCategory.id}
                  </div>
                  <div>
                    <strong>父分类ID：</strong>
                    {selectedCategory.parent_id || '无（根节点）'}
                  </div>
                  <div>
                    <strong>层级：</strong>第 {selectedCategory.level || '1'} 级
                  </div>
                  <div>
                    <strong>状态：</strong>
                    <span
                      style={{
                        color:
                          selectedCategory.status?.code ===
                          COMMON_CATEGORY_STATUS_CODE.ACTIVE
                            ? '#52c41a'
                            : '#999',
                      }}
                    >
                      {selectedCategory.status?.name}
                    </span>
                  </div>
                  <div>
                    <strong>子分类数量：</strong>
                    {selectedCategory.children?.length || 0}
                  </div>
                  {selectedCategory.create_time && (
                    <div>
                      <strong>创建时间：</strong>
                      {selectedCategory.create_time}
                    </div>
                  )}
                  {selectedCategory.modify_time && (
                    <div>
                      <strong>修改时间：</strong>
                      {selectedCategory.modify_time}
                    </div>
                  )}
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
                <FolderOpenOutlined
                  style={{ fontSize: 48, marginBottom: 16 }}
                />
                <div>请在左侧选择一个分类查看详情</div>
              </div>
            )}
          </Col>
        </Row>

        <Modal
          title={
            modalMode === 'add'
              ? form.getFieldValue('parent_id') === 0
                ? '添加分类'
                : '添加子分类'
              : '编辑分类'
          }
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
          </Form>
        </Modal>
      </Card>
    </PageContainer>
  );
};

export default CategoryManagement;
