import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { Role } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { AccessAPI } from '@/services/System/access/AcessController';
import type {
  ApiAccessResponse,
  ApiDetail,
  ApiList,
} from '@/services/System/access/typings';
import { resolveCommonStatus } from '@/utils/status';
import { Table } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getDetailColumns, getListColumns } from './columns';
import OperatorForm from './opreatorForm';
import { SearchForm } from './searchForm';

const AccessApiManagement: React.FC = () => {
  const baseListRef = useRef<BaseListPageRef>(null);
  const [selectedRecord, setSelectedRecord] = useState<ApiDetail | null>(null);
  const changeStatusModal = useModalControl();
  const createModal = useModalControl();

  const detailColumns = useMemo(
    () =>
      getDetailColumns({
        onToggleStatus: (record) => {
          setSelectedRecord(record);
          changeStatusModal.open();
        },
      }),
    [changeStatusModal],
  );

  const listColumns = useMemo(() => getListColumns(), []);

  const fetchData = useCallback(async (params: any) => {
    const { data }: { data: ApiAccessResponse } = await AccessAPI.getApiList(
      params,
    );

    return {
      list: data.api_list || [],
      total: data.api_list?.length || 0,
    };
  }, []);

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title="接口管理"
        columns={listColumns as any}
        searchFormItems={<SearchForm />}
        defaultSearchParams={{ module: Role.Platform }}
        fetchData={fetchData}
        rowKey={(record: ApiList) => record.level || record.level_name || ''}
        expandable={{
          expandedRowRender: (record: ApiList) => (
            <Table
              columns={detailColumns as any}
              dataSource={record.api_details || []}
              rowKey={(item) => item.api_code || `${item.module}-${item.name}`}
              pagination={false}
            />
          ),
        }}
        createButton={{
          text: '新建接口',
          onClick: () => createModal.open(),
        }}
      />
      {/* 修改状态弹窗 */}
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={() => {
          changeStatusModal.close();
          setSelectedRecord(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        name={selectedRecord?.name || '接口'}
        params={{
          api_code: selectedRecord?.api_code || '',
          status:
            resolveCommonStatus(selectedRecord?.status) === 'active'
              ? 'deleted'
              : 'active',
        }}
        api={AccessAPI.updateApiStatus}
      />

      {/* 新建接口弹窗 */}
      <CreateOrModifyForm
        modalVisible={createModal.visible}
        onCancel={() => createModal.close()}
        refresh={() => baseListRef.current?.getData()}
        text={{ title: '新建接口', successMsg: '创建接口成功' }}
        api={AccessAPI.createApi}
        record={null}
      >
        <OperatorForm />
      </CreateOrModifyForm>
    </>
  );
};

export default AccessApiManagement;
