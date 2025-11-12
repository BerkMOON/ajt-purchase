import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import ChangeStatusForm from '@/components/BasicComponents/ChangeStatusForm';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { CompanyAPI } from '@/services/System/company/CompanyController';
import type {
  CompanyItem,
  CompanyParams,
} from '@/services/System/company/typing';
import { Navigate, useAccess } from '@umijs/max';
import React, { useRef, useState } from 'react';
import { getColumns } from './colums';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const CompanyList: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const changeStatusModal = useModalControl();
  const createOrModifyModal = useModalControl();
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(
    null,
  );

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    company?: CompanyItem,
  ) => {
    if (company) {
      setSelectedCompany(company);
    } else {
      setSelectedCompany(null);
    }
    modalControl.open();
  };

  const columns = getColumns({
    handleModalOpen,
    changeStatusModal,
    createOrModifyModal,
  });

  const fetchCompanyData = async (params: CompanyParams) => {
    const { data } = await CompanyAPI.getAllCompanies(params);
    return {
      list: data.companies,
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
        title="公司列表"
        columns={columns}
        defaultSearchParams={{ status: COMMON_STATUS.ACTIVE }}
        searchFormItems={searchForm}
        fetchData={fetchCompanyData}
        createButton={{
          text: '新建公司',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
      />
      <ChangeStatusForm
        modalVisible={changeStatusModal.visible}
        onCancel={changeStatusModal.close}
        refresh={() => baseListRef.current?.getData()}
        params={{
          company_id: selectedCompany?.id || '',
          status:
            selectedCompany?.status.code === COMMON_STATUS_CODE.ACTIVE
              ? COMMON_STATUS.DELETED
              : COMMON_STATUS.ACTIVE,
        }}
        name={selectedCompany?.company_name || '公司'}
        api={CompanyAPI.updateCompanyStatus}
      />
      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedCompany(null);
        }}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: '公司',
          successMsg: `${selectedCompany ? '修改' : '创建'}公司成功`,
        }}
        api={
          selectedCompany ? CompanyAPI.updateCompany : CompanyAPI.createCompany
        }
        record={selectedCompany}
        idMapKey="company_id"
      >
        {createAndModifyForm}
      </CreateOrModifyForm>
    </>
  );
};

export default CompanyList;
