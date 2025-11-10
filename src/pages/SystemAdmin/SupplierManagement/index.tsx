import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { SupplierAPI } from '@/services/supplier/supplierController';
import type {
  SupplierInfo,
  SupplierListRequest,
} from '@/services/supplier/typings';
import { Navigate, useAccess } from '@umijs/max';
import React, { useRef, useState } from 'react';
import { getColumns } from './colums';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const SupplierManagement: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const changeStatusModal = useModalControl();
  const createOrModifyModal = useModalControl();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierInfo | null>(
    null,
  );

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    supplier?: SupplierInfo,
  ) => {
    if (supplier) {
      setSelectedSupplier(supplier);
    } else {
      setSelectedSupplier(null);
    }
    modalControl.open();
  };

  const columns = getColumns({
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
  });

  const fetchSupplierData = async (params: SupplierListRequest) => {
    const { data } = await SupplierAPI.getSupplierList(params);
    return {
      list: data.suppliers,
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
        title="供应商列表"
        columns={columns}
        searchFormItems={searchForm}
        defaultSearchParams={{ status: COMMON_STATUS.ACTIVE }}
        fetchData={fetchSupplierData}
        createButton={{
          text: '新建供应商',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={() => {
          changeStatusModal.close();
          setSelectedSupplier(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        params={{
          supplier_id: selectedSupplier?.id || '',
          status:
            selectedSupplier?.status?.code === COMMON_STATUS_CODE.ACTIVE
              ? COMMON_STATUS.DELETED
              : COMMON_STATUS.ACTIVE,
        }}
        name={selectedSupplier?.supplier_name || '供应商'}
        api={SupplierAPI.updateSupplierStatus}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedSupplier(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '供应商',
          successMsg: `${selectedSupplier ? '修改' : '创建'}供应商成功`,
        }}
        api={
          selectedSupplier
            ? SupplierAPI.updateSupplier
            : SupplierAPI.createSupplier
        }
        record={selectedSupplier}
        idMapKey="supplier_id"
      >
        {createAndModifyForm({ isModify: !!selectedSupplier })}
      </CreateOrModifyForm>
    </>
  );
};

export default SupplierManagement;
