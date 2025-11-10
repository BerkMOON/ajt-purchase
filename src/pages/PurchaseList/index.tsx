import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import DeleteForm from '@/components/BasicComponents/DeleteForm';
import { useModalControl } from '@/hooks/useModalControl';
import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import type { PurchaseItem, PurchaseParams } from '@/services/purchase/typings';
import { Navigate, useAccess } from '@umijs/max';
import { Card, message, Modal, Result, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { getColumns } from './colums';
import { createAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const { TabPane } = Tabs;

const PurchaseList: React.FC = () => {
  const { isLogin } = useAccess();
  // 添加权限检查，可以根据实际需求调整
  const { purchaseList } = useAccess();
  const draftListRef = useRef<BaseListPageRef>(null);
  const formalListRef = useRef<BaseListPageRef>(null);
  const deleteModal = useModalControl();
  const createOrModifyModal = useModalControl();
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<'draft' | 'formal'>('draft');

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

  // 处理提交采购单（草稿 → 待询价）
  const handleSubmit = async (record: PurchaseItem) => {
    Modal.confirm({
      title: '确认提交',
      content: `确定要提交采购单 ${record.purchase_no} 吗？提交后将进入审核流程，草稿将从临时存储中移除。`,
      onOk: async () => {
        try {
          await PurchaseAPI.submitPurchase(record.id);
          message.success('提交成功');
          // 刷新草稿列表和正式列表
          draftListRef.current?.getData();
          formalListRef.current?.getData();
        } catch (error) {
          message.error('提交失败');
        }
      },
    });
  };

  // 草稿列表的列配置
  const draftColumns = getColumns({
    handleModalOpen,
    deleteModal,
    createOrModifyModal,
    onSubmit: handleSubmit,
    isDraft: true,
  }) as any;

  // 正式采购单列表的列配置
  const formalColumns = getColumns({
    handleModalOpen,
    deleteModal,
    createOrModifyModal,
    onSubmit: handleSubmit,
    isDraft: false,
  }) as any;

  // 获取草稿列表数据（从 Redis）
  const fetchDraftData = async (params: any) => {
    // 处理日期范围参数
    const searchParams: PurchaseParams = {
      ...params,
      status_codes: [1], // 草稿状态
    };

    if (params.date_range) {
      searchParams.start_date = params.date_range[0]?.format('YYYY-MM-DD');
      searchParams.end_date = params.date_range[1]?.format('YYYY-MM-DD');
      delete searchParams.date_range;
    }

    // 调用专门的 Redis API 获取草稿
    const response = await PurchaseAPI.getDraftPurchases(searchParams);
    return {
      list: response.data.purchase_list,
      total: response.data.meta.total_count,
    };
  };

  // 获取正式采购单数据（从数据库，排除草稿）
  const fetchFormalData = async (params: any) => {
    // 处理日期范围参数
    const searchParams: PurchaseParams = {
      ...params,
      exclude_status: 1, // 排除草稿状态
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

  // 刷新当前列表
  const refreshCurrentList = () => {
    if (activeTab === 'draft') {
      draftListRef.current?.getData();
    } else {
      formalListRef.current?.getData();
    }
  };

  // 新建/编辑采购单后的刷新逻辑
  const refreshAfterCreateOrModify = () => {
    if (selectedPurchase) {
      // 编辑：刷新当前列表
      refreshCurrentList();
    } else {
      // 新建：始终刷新草稿列表，并切换到草稿箱 Tab
      draftListRef.current?.getData();
      setActiveTab('draft');
    }
  };

  return (
    <>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'draft' | 'formal')}
          size="large"
        >
          <TabPane
            tab={
              <span>
                📝 草稿箱
                <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                  (临时保存一天后自动删除)
                </span>
              </span>
            }
            key="draft"
          >
            <div
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                background: '#f0f5ff',
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 14, color: '#1890ff' }}>
                💡 提示：草稿仅临时保存一天，建议及时提交审核
              </span>
            </div>
            <BaseListPage
              ref={draftListRef}
              title="草稿采购单"
              columns={draftColumns}
              searchFormItems={searchForm}
              fetchData={fetchDraftData}
              createButton={{
                text: '新建采购单',
                onClick: () => handleModalOpen(createOrModifyModal),
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                📋 正式采购单
                <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                  (已提交审核及后续状态)
                </span>
              </span>
            }
            key="formal"
          >
            <BaseListPage
              ref={formalListRef}
              title="正式采购单列表"
              columns={formalColumns}
              searchFormItems={searchForm}
              fetchData={fetchFormalData}
            />
          </TabPane>
        </Tabs>
      </Card>

      <DeleteForm
        modalVisible={deleteModal.visible}
        onCancel={deleteModal.close}
        refresh={refreshCurrentList}
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
        refresh={refreshAfterCreateOrModify}
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
