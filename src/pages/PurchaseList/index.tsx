import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import DeleteForm from '@/components/BasicComponents/DeleteForm';
import { useModalControl } from '@/hooks/useModalControl';
import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import type { PurchaseItem, PurchaseParams } from '@/services/purchase/typings';
import { Navigate, useAccess } from '@umijs/max';
import { message, Modal, Result } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { getColumns } from './colums';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const PurchaseList: React.FC = () => {
  const { isLogin } = useAccess();
  // 添加权限检查，可以根据实际需求调整
  const { purchaseList } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const deleteModal = useModalControl();
  const createOrModifyModal = useModalControl();
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(
    null,
  );

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    purchase?: PurchaseItem,
  ) => {
    if (purchase) {
      setSelectedPurchase(purchase);
    } else {
      setSelectedPurchase(null);
    }
    modalControl.open();
  };

  // 处理提交采购单
  const handleSubmit = async (record: PurchaseItem) => {
    Modal.confirm({
      title: '确认提交',
      content: `确定要提交采购单 ${record.purchase_no} 吗？提交后将进入审核流程。`,
      onOk: async () => {
        try {
          await PurchaseAPI.submitPurchase(record.id);
          message.success('提交成功');
          baseListRef.current?.getData();
        } catch (error) {
          message.error('提交失败');
        }
      },
    });
  };

  const columns = getColumns({
    handleModalOpen,
    deleteModal,
    createOrModifyModal,
    onSubmit: handleSubmit,
  });

  const fetchPurchaseData = async (params: any) => {
    // 处理日期范围参数
    const searchParams: PurchaseParams = {
      ...params,
    };

    if (params.date_range) {
      searchParams.start_date = params.date_range[0]?.format('YYYY-MM-DD');
      searchParams.end_date = params.date_range[1]?.format('YYYY-MM-DD');
      delete searchParams.date_range;
    }

    const response = await PurchaseAPI.getAllPurchases(searchParams);
    return {
      list: response.data.purchase_list,
      total: response.data.meta.total_count,
    };
  };

  const handleFormFields = (values: any) => {
    // 处理日期格式
    return {
      ...values,
      expected_delivery_date:
        values.expected_delivery_date?.format('YYYY-MM-DD'),
    };
  };

  // 处理编辑时的初始值，将字符串日期转换为dayjs对象
  const processRecordForEdit = (record: PurchaseItem | null) => {
    if (!record) return null;

    return {
      ...record,
      expected_delivery_date: record.expected_delivery_date
        ? dayjs(record.expected_delivery_date)
        : null,
    };
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!purchaseList) {
    return <Result status="403" title="403" subTitle="无权限访问" />;
  }

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title="采购单列表"
        columns={columns}
        searchFormItems={searchForm}
        fetchData={fetchPurchaseData}
        createButton={{
          text: '新建采购单',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <DeleteForm
        modalVisible={deleteModal.visible}
        onCancel={deleteModal.close}
        refresh={() => baseListRef.current?.getData()}
        params={{ purchase_id: selectedPurchase?.id || '' }}
        name="采购单"
        api={PurchaseAPI.deletePurchase}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedPurchase(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '采购单',
          successMsg: `${selectedPurchase ? '修改' : '创建'}采购单成功`,
        }}
        api={
          selectedPurchase
            ? PurchaseAPI.updatePurchase
            : PurchaseAPI.createPurchase
        }
        record={processRecordForEdit(selectedPurchase)}
        idMapKey="purchase_id"
        operatorFields={handleFormFields}
        width={1200}
      >
        {createAndModifyForm}
      </CreateOrModifyForm>
    </>
  );
};

export default PurchaseList;
