import { ROLES_INFO } from '@/constants';
import type { ApiDetail, ApiList } from '@/services/system/access/typings';
import { getStatusMeta, resolveCommonStatus } from '@/utils/status';
import type { TableProps } from 'antd';
import { Button, Divider, Tag } from 'antd';

export const getDetailColumns = (opts: {
  onToggleStatus: (record: ApiDetail) => void;
}): TableProps<ApiDetail>['columns'] => {
  const { onToggleStatus } = opts;

  return [
    {
      title: '接口编码',
      dataIndex: 'api_code',
      width: 160,
    },
    {
      title: '接口名称',
      dataIndex: 'name',
      width: 180,
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      width: 140,
      render: (value: ApiDetail['module']) => {
        const mapped = value
          ? (ROLES_INFO as Record<string, string>)[value]
          : undefined;
        return mapped || value || '';
      },
    },
    {
      title: '路径匹配',
      dataIndex: 'path_pattern',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (_: any, record: ApiDetail) => {
        const statusValue = resolveCommonStatus(record.status);
        const meta = getStatusMeta(statusValue);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 180,
    },
    {
      title: '最近修改',
      dataIndex: 'modify_time',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiDetail) => {
        const isActive = resolveCommonStatus(record.status) === 'active';
        return (
          <>
            <Button
              type="link"
              onClick={() => onToggleStatus(record)}
              danger={isActive}
            >
              {isActive ? '停用接口' : '恢复接口'}
            </Button>
            <Divider type="vertical" />
          </>
        );
      },
    },
  ];
};

export const getListColumns = (): TableProps<ApiList>['columns'] => {
  return [
    {
      title: '接口层级',
      dataIndex: 'level_name',
      width: 180,
    },
    {
      title: '层级编码',
      dataIndex: 'level',
      width: 160,
    },
    {
      title: '接口数量',
      key: 'count',
      width: 120,
      render: (_: any, record: ApiList) => record.api_details?.length || 0,
    },
  ];
};
