import { COMMON_STATUS_CODE } from '@/constants';
import { ModalControl } from '@/hooks/useModalControl';
import { BrandInfo, SupplierInfo } from '@/services/system/supplier/typings';
import { ColumnsProps } from '@/types/common';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import { Button, Divider, Tag } from 'antd';

type SupplierColumnsProps = ColumnsProps<SupplierInfo> & {
  changeStatusModal: ModalControl;
};

export const getColumns = (props: SupplierColumnsProps) => {
  const { handleModalOpen, createOrModifyModal, changeStatusModal } = props;

  return [
    {
      title: '供应商编码',
      dataIndex: 'supplier_code',
      key: 'supplier_code',
    },
    {
      title: '供应商名称',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: '供应商所属品牌',
      dataIndex: 'brand_infos',
      key: 'brand_infos',
      render: (brand_infos: BrandInfo[]) => {
        return brand_infos.map((brand: any) => brand.brand_name).join(',');
      },
    },
    {
      title: '联系人',
      dataIndex: 'contacts',
      key: 'contacts',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      render: (_: string, record: SupplierInfo) => {
        const parts = [record?.province, record?.city, record?.address].filter(
          Boolean,
        );
        return parts.join(' ');
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: SupplierInfo) => {
        const statusValue = resolveCommonStatus(record.status);
        const meta = getStatusMeta(statusValue);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
    },
    {
      title: '更新时间',
      dataIndex: 'modify_time',
      key: 'modify_time',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SupplierInfo) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => handleModalOpen(createOrModifyModal, record)}
            >
              编辑供应商信息
            </Button>
            <Divider type="vertical" />
            <a
              onClick={() =>
                handleModalOpen(changeStatusModal as ModalControl, record)
              }
            >
              {record.status.code === COMMON_STATUS_CODE.ACTIVE
                ? '停用供应商'
                : '恢复供应商'}
            </a>
          </>
        );
      },
    },
  ];
};
