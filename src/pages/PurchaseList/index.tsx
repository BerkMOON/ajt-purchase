import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import DeleteForm from '@/components/BasicComponents/DeleteForm';
import { Role } from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { PurchaseAPI } from '@/services/purchase/PurchaseController';
import {
  CategoryType,
  type PurchaseDraftItem,
  type PurchaseItem,
  type PurchaseParams,
} from '@/services/purchase/typings.d';
import { UserInfo } from '@/services/System/user/typings';
import { Navigate, useAccess, useModel } from '@umijs/max';
import { Card, message, Modal, Result, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { getColumns } from './colums';
import { CreateAndModifyForm } from './opreatorForm';
import { searchForm } from './searchForm';

const { TabPane } = Tabs;

const PurchaseList: React.FC = () => {
  const { isLogin } = useAccess();
  // 添加权限检查，可以根据实际需求调整
  const { purchaseList } = useAccess();
  const { initialState } = useModel('@@initialState');
  const user = (initialState || {}) as UserInfo & { isLogin: boolean };
  const isStoreUser = user.user_type === Role.Store;

  // 获取门店用户的门店ID列表
  const userStoreIds = React.useMemo(() => {
    if (isStoreUser && user.store_infos) {
      return user.store_infos.map((store) => store.store_id);
    }
    return [];
  }, [isStoreUser, user.store_infos]);

  const draftListRef = useRef<BaseListPageRef>(null);
  const formalListRef = useRef<BaseListPageRef>(null);
  const deleteModal = useModalControl();
  const createOrModifyModal = useModalControl();
  const [selectedDraft, setSelectedDraft] = useState<PurchaseDraftItem | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<'draft' | 'formal'>('draft');

  const handleDraftModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    draft?: PurchaseDraftItem,
  ) => {
    setSelectedDraft(draft ?? null);
    modalControl.open();
  };

  // 处理提交采购单（草稿 → 待审核）
  const handleSubmit = async (record: PurchaseDraftItem) => {
    Modal.confirm({
      title: '确认提交',
      content: `确定要提交门店【${record.store_name}】的草稿吗？提交后将进入审核流程（第一版自动审核），审核通过后系统将自动向供应商发起询价。`,
      onOk: async () => {
        try {
          await PurchaseAPI.submitDraft(record.store_id);
          message.success('提交成功！采购单已进入审核流程');
          setSelectedDraft(null);
          // 刷新草稿列表和正式列表
          draftListRef.current?.getData();
          formalListRef.current?.getData();
        } catch (error) {
          message.error('提交失败');
        }
      },
    });
  };

  const handleDraftColumnModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    record: PurchaseDraftItem,
  ) => {
    handleDraftModalOpen(modalControl, record);
  };

  const handleDraftColumnSubmit = (record: PurchaseDraftItem) => {
    handleSubmit(record);
  };

  const handleFormalColumnModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    record: PurchaseItem,
  ) => {
    void modalControl;
    void record;
    // 正式列表在列表页仅支持查看，无需打开弹窗
  };

  // 草稿列表的列配置
  const draftColumns = getColumns({
    handleModalOpen: handleDraftColumnModalOpen,
    deleteModal,
    createOrModifyModal,
    onSubmit: handleDraftColumnSubmit,
    isDraft: true,
  }) as any;

  // 正式采购单列表的列配置
  const formalColumns = getColumns({
    handleModalOpen: handleFormalColumnModalOpen,
    deleteModal,
    createOrModifyModal,
    isDraft: false,
  }) as any;

  // 获取草稿列表数据（从 Redis）
  const fetchDraftData = async () => {
    // 调用专门的 Redis API 获取草稿
    const response = await PurchaseAPI.getDraftPurchases();
    return {
      list: response.data.drafts || [],
      total: response.data.drafts?.length || 0,
    };
  };

  // 获取正式采购单数据（从数据库，排除草稿）
  const fetchFormalData = async (params: any) => {
    // 处理日期范围参数
    const searchParams: PurchaseParams = {
      page: params.page,
      limit: params.limit,
    };

    // 采购单号
    if (params.order_no) {
      searchParams.order_no = params.order_no;
    }

    // 门店筛选（多选，转为逗号分隔）
    // 如果是门店用户，自动限制为自己的门店
    if (isStoreUser) {
      // 门店用户只能查看自己的门店，自动添加门店筛选
      if (userStoreIds.length > 0) {
        searchParams.store_ids = userStoreIds.join(',');
      }
    } else if (params.store_ids && params.store_ids.length > 0) {
      // 平台用户可以使用筛选的门店
      searchParams.store_ids = params.store_ids.join(',');
    }

    // 状态筛选（多选，转为逗号分隔）
    if (params.statuses && params.statuses.length > 0) {
      searchParams.statuses = params.statuses.join(',');
    }

    // 日期范围
    if (params.date_range) {
      searchParams.start_date = params.date_range[0]?.format('YYYY-MM-DD');
      searchParams.end_date = params.date_range[1]?.format('YYYY-MM-DD');
    }

    const response = await PurchaseAPI.getAllPurchases(searchParams);
    return {
      list: response.data.orders || [],
      total: response.data.count.total_count,
    };
  };

  const handleFormFields = (values: any) => {
    // 处理日期格式，并设置默认 order_type 为 1（备品）
    return {
      ...values,
      expected_delivery_date:
        values.expected_delivery_date?.format('YYYY-MM-DD'),
      inquiry_deadline: values.inquiry_deadline
        ? dayjs(values.inquiry_deadline).toISOString()
        : null,
      order_type: CategoryType.PARTS,
    };
  };

  // 处理编辑时的初始值，将字符串日期转换为dayjs对象
  const processRecordForEdit = (record: PurchaseDraftItem | null) => {
    if (!record) return null;

    return {
      ...record,
      expected_delivery_date: record.expected_delivery_date
        ? dayjs(record.expected_delivery_date)
        : null,
      inquiry_deadline: record.inquiry_deadline
        ? dayjs(record.inquiry_deadline)
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
    if (selectedDraft) {
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
                  (临时保存3天后自动删除)
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
                💡 提示：草稿仅临时保存3天，建议及时提交审核
              </span>
            </div>
            <BaseListPage
              ref={draftListRef}
              title="草稿采购单"
              columns={draftColumns}
              searchFormItems={searchForm}
              fetchData={fetchDraftData}
              rowKey="store_id"
              createButton={{
                text: '新建采购单',
                onClick: () => handleDraftModalOpen(createOrModifyModal),
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
        onCancel={() => {
          deleteModal.close();
          setSelectedDraft(null);
        }}
        refresh={refreshCurrentList}
        params={{ store_id: selectedDraft?.store_id }}
        name="采购单草稿"
        api={(params) => PurchaseAPI.deleteDraft(params.store_id)}
      />

      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={() => {
          createOrModifyModal.close();
          setSelectedDraft(null);
        }}
        refresh={refreshAfterCreateOrModify}
        text={{
          title: '采购单',
          successMsg: `${selectedDraft ? '修改' : '创建'}采购单成功`,
        }}
        api={selectedDraft ? PurchaseAPI.updateDraft : PurchaseAPI.createDraft}
        record={processRecordForEdit(selectedDraft)}
        idMapKey="store_id"
        idMapValue="store_id"
        operatorFields={handleFormFields}
        width={1200}
      >
        <CreateAndModifyForm
          user={user}
          isStoreUser={isStoreUser}
          userStoreIds={userStoreIds}
          isEdit={!!selectedDraft}
        />
      </CreateOrModifyForm>
    </>
  );
};

export default PurchaseList;
