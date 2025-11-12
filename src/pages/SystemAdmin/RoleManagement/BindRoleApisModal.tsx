import BaseModalForm from '@/components/BasicComponents/BaseModalForm';
import { useRequest } from '@/hooks/useRequest';
import { AccessAPI } from '@/services/System/access/AcessController';
import { ApiAccessResponse, ApiList } from '@/services/System/access/typings';
import { RoleAPI } from '@/services/System/role/RoleController';
import { RoleInfo } from '@/services/System/role/typings';
import { Empty, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useState } from 'react';

interface BindRoleApisModalProps {
  visible: boolean;
  onCancel: () => void;
  roleId?: string | number;
  roleName?: string;
  refresh?: () => void;
  selectedRole?: RoleInfo;
}

const BindRoleApisModal: React.FC<BindRoleApisModalProps> = ({
  visible,
  onCancel,
  roleId,
  roleName,
  refresh,
  selectedRole,
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);

  const { loading: binding, run: runBind } = useRequest(RoleAPI.bindApis, {
    successMsg: '绑定接口成功',
    onSuccess: () => {
      refresh?.();
    },
  });

  const buildTree = (apiListGroups: ApiList[] = []): DataNode[] => {
    return apiListGroups.map((group) => ({
      title: group.level_name || group.level || '未知层级',
      key: group.level || group.level_name || `level_${Math.random()}`,
      selectable: false,
      children: (group.api_details || []).map((d) => ({
        title: `${d?.name || ''}${d?.module ? `（${d.module}）` : ''}`,
        key: d?.api_code || `${d?.name}_${d?.path_pattern}`,
        isLeaf: true,
      })),
    }));
  };

  const fetchData = async () => {
    if (!visible || !roleId) return;
    setFetching(true);
    try {
      const [{ data: apiListResp }, { data: roleApisResp }] = await Promise.all(
        [
          AccessAPI.getApiList({ module: selectedRole?.role_type }),
          RoleAPI.listRoleApis({ role_id: String(roleId) }),
        ],
      );

      const apiGroups = (apiListResp as ApiAccessResponse)?.api_list || [];
      setTreeData(buildTree(apiGroups));
      setCheckedKeys(roleApisResp?.code_list || []);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, roleId]);

  const handleSubmit = async () => {
    if (!roleId) return;
    const leafKeys = checkedKeys.filter((key) =>
      treeData.some((group) =>
        group.children?.some((child) => child.key === key),
      ),
    );
    await runBind({ role_id: Number(roleId), api_codes: leafKeys });
  };

  const title = `绑定接口${roleName ? ` - ${roleName}` : ''}`;

  return (
    <BaseModalForm
      title={title}
      visible={visible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      width={520}
      loading={binding || fetching}
    >
      {treeData.length === 0 ? (
        <Empty description="暂无接口数据" />
      ) : (
        <Tree
          checkable
          blockNode
          treeData={treeData}
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as string[])}
        />
      )}
    </BaseModalForm>
  );
};

export default BindRoleApisModal;
