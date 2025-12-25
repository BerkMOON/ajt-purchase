import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { BrandAPI } from '@/services/system/brand/BrandController';
import type {
  BrandDetailResponse,
  GetBrandListParams,
} from '@/services/system/brand/typings';
import { Navigate, useAccess } from '@umijs/max';
import React, { useRef, useState } from 'react';
import { getColumns } from './columns';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const BrandManagement: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const createOrModifyModal = useModalControl();
  const changeStatusModal = useModalControl();
  const [selectedBrand, setSelectedBrand] =
    useState<BrandDetailResponse | null>(null);

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    brand?: BrandDetailResponse,
  ) => {
    if (brand) {
      setSelectedBrand(brand);
    } else {
      setSelectedBrand(null);
    }
    modalControl.open();
  };

  const columns = getColumns({
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
  });

  const fetchBrandData = async (params: GetBrandListParams) => {
    const { data } = await BrandAPI.getList(params);
    return {
      list: data.brands,
      total: data.count.total_count,
    };
  };

  const submitBrandForm = async (values: any) => {
    if (selectedBrand?.id) {
      // 编辑
      return BrandAPI.update({
        brand_id: selectedBrand.id,
        brand_name: values.brand_name,
        remark: values.remark,
      });
    } else {
      // 创建
      return BrandAPI.create({
        brand_name: values.brand_name,
        remark: values.remark,
      });
    }
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title="品牌管理"
        columns={columns}
        searchFormItems={searchForm}
        defaultSearchParams={{
          status: COMMON_STATUS.ACTIVE,
        }}
        fetchData={fetchBrandData}
        createButton={{
          text: '新建品牌',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={changeStatusModal.close}
        refresh={() => baseListRef.current?.getData()}
        params={{
          brand_id: selectedBrand?.id || 0,
          status:
            selectedBrand?.status?.code === COMMON_STATUS_CODE.ACTIVE
              ? COMMON_STATUS.DELETED
              : COMMON_STATUS.ACTIVE,
        }}
        name={selectedBrand?.brand_name || '品牌'}
        api={(params?: any) => {
          if (!params?.brand_id) {
            throw new Error('品牌ID不存在');
          }
          return BrandAPI.updateStatus(params.brand_id, params.status);
        }}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedBrand(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '品牌',
          successMsg: `${selectedBrand ? '修改' : '创建'}品牌成功`,
        }}
        api={submitBrandForm}
        record={selectedBrand}
        idMapKey="id"
      >
        {createAndModifyForm()}
      </CreateOrModifyForm>
    </>
  );
};

export default BrandManagement;
