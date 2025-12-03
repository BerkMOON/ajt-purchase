import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { StoreAPI } from '@/services/system/store/StoreController';
import type { StoreItem, StoreParams } from '@/services/system/store/typing';
import { Navigate, useAccess } from '@umijs/max';
import React, { useRef, useState } from 'react';
import { getColumns } from './colums';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const StoreList: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const createOrModifyModal = useModalControl();
  const changeStatusModal = useModalControl();
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    store?: StoreItem,
  ) => {
    if (store) {
      setSelectedStore(store);
    } else {
      setSelectedStore(null);
    }
    modalControl.open();
  };

  const columns = getColumns({
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
  });

  const fetchStoreData = async (params: StoreParams) => {
    const { data } = await StoreAPI.getAllStores(params);
    return {
      list: data.stores,
      total: data.count.total_count,
    };
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title="门店列表"
        columns={columns}
        searchFormItems={searchForm}
        defaultSearchParams={{
          status: COMMON_STATUS.ACTIVE,
        }}
        fetchData={fetchStoreData}
        createButton={{
          text: '新建门店',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={changeStatusModal.close}
        refresh={() => baseListRef.current?.getData()}
        params={{
          store_id: selectedStore?.id || '',
          status:
            selectedStore?.status.code === COMMON_STATUS_CODE.ACTIVE
              ? COMMON_STATUS.DELETED
              : COMMON_STATUS.ACTIVE,
        }}
        name={selectedStore?.store_name || '门店'}
        api={StoreAPI.updateStoreStatus}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedStore(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '门店',
          successMsg: `${selectedStore ? '修改' : '创建'}门店成功`,
        }}
        api={selectedStore ? StoreAPI.updateStore : StoreAPI.createStore}
        record={selectedStore}
        idMapKey="store_id"
      >
        {createAndModifyForm({ isModify: !!selectedStore })}
      </CreateOrModifyForm>
    </>
  );
};

export default StoreList;
