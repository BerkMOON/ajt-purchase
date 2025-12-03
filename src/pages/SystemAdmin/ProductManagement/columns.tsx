import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import { ModalControl } from '@/hooks/useModalControl';
import type { ProductDetailResponse } from '@/services/system/product/typings';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ColumnsProps {
  handleModalOpen: (
    modal: ModalControl,
    record?: ProductDetailResponse,
  ) => void;
  handleChangeStatus: (record: ProductDetailResponse) => void;
  deleteModal: ModalControl;
}

export const getColumns = ({
  handleModalOpen,
  handleChangeStatus,
  deleteModal,
}: ColumnsProps): ColumnsType<ProductDetailResponse> => {
  return [
    {
      title: '产品ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 100,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '所属品类',
      key: 'category_tree',
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        if (record.category_tree && record.category_tree.length > 0) {
          return record.category_tree.map((cat) => cat.name).join(' > ');
        }
        return '-';
      },
    },
    {
      title: '类型',
      dataIndex: 'product_type',
      key: 'product_type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{type === 'parts' ? '备件' : type || '备件'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: any) =>
        status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE ? (
          <Tag color="success">启用</Tag>
        ) : (
          <Tag color="default">停用</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const isActive =
          record.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                if (record.product_id) {
                  history.push(`/admin/product/${record.product_id}`);
                }
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              icon={
                isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />
              }
              onClick={() => handleChangeStatus(record)}
            >
              {isActive ? '停用' : '启用'}
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleModalOpen(deleteModal, record)}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
};
