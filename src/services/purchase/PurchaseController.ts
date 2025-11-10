// ============ HTTP 请求版本（注释掉，保留备用） ============
// import { request } from '@umijs/max';
// import type { ResponseInfoType } from '@/types/common';
// import type {
//   PurchaseItem,
//   PurchaseParams,
//   CreatePurchaseParams,
//   UpdatePurchaseParams,
//   PageInfo_PurchaseItem,
// } from './typings';

// const API_PREFIX = '/api/purchase';

// export const PurchaseAPI = {
//   getAllPurchases: async (params: PurchaseParams) => {
//     return request<ResponseInfoType<PageInfo_PurchaseItem>>(`${API_PREFIX}/list`, {
//       method: 'GET',
//       params,
//     });
//   },

//   getPurchaseDetail: async (purchaseId: string) => {
//     return request<ResponseInfoType<PurchaseItem>>(`${API_PREFIX}/${purchaseId}`, {
//       method: 'GET',
//     });
//   },

//   createPurchase: async (params: CreatePurchaseParams) => {
//     return request<ResponseInfoType<PurchaseItem>>(`${API_PREFIX}/create`, {
//       method: 'POST',
//       data: params,
//     });
//   },

//   updatePurchase: async (params: UpdatePurchaseParams) => {
//     return request<ResponseInfoType<PurchaseItem>>(`${API_PREFIX}/${params.purchase_id}`, {
//       method: 'PUT',
//       data: params,
//     });
//   },

//   deletePurchase: async (params: { purchase_id: string }) => {
//     return request<ResponseInfoType<null>>(`${API_PREFIX}/${params.purchase_id}`, {
//       method: 'DELETE',
//     });
//   },

//   submitPurchase: async (purchaseId: string) => {
//     return request<{
//       code: number;
//       message: string;
//     }>(`${API_PREFIX}/${purchaseId}/submit`, {
//       method: 'POST',
//     });
//   },

//   approvePurchase: async (purchaseId: string) => {
//     return request<{
//       code: number;
//       message: string;
//     }>(`${API_PREFIX}/${purchaseId}/approve`, {
//       method: 'POST',
//     });
//   },

//   rejectPurchase: async (purchaseId: string, reason: string) => {
//     return request<{
//       code: number;
//       message: string;
//     }>(`${API_PREFIX}/${purchaseId}/reject`, {
//       method: 'POST',
//       data: { reason },
//     });
//   },
// };

// ============ LocalStorage 版本（当前使用） ============
import type { ResponseInfoType } from '@/types/common';
import type {
  CreatePurchaseParams,
  PageInfo_PurchaseItem,
  PurchaseItem,
  PurchaseParams,
  UpdatePurchaseParams,
} from './typings';
import { PurchaseStatusMap } from './typings.d';

// localStorage存储键名
const STORAGE_KEYS = {
  PURCHASE_LIST: 'ajt_purchase_list',
  PURCHASE_COUNTER: 'ajt_purchase_counter',
  QUOTES_DATA: 'ajt_quotes_data', // 存储报价数据
  DRAFT_PURCHASES: 'ajt_draft_purchases', // 存储草稿（模拟 Redis）
};

// 工具函数：获取localStorage数据
const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage get error:', error);
    return defaultValue;
  }
};

// 工具函数：设置localStorage数据
const setStorageData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage set error:', error);
  }
};

// 工具函数：生成唯一ID
const generateId = (): string => {
  const counter = getStorageData(STORAGE_KEYS.PURCHASE_COUNTER, 0);
  const newCounter = counter + 1;
  setStorageData(STORAGE_KEYS.PURCHASE_COUNTER, newCounter);
  return newCounter.toString();
};

// 工具函数：生成采购单号
const generatePurchaseNo = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const counter = getStorageData(STORAGE_KEYS.PURCHASE_COUNTER, 0);
  const sequence = String(counter + 1).padStart(4, '0');
  return `PO${year}${month}${day}${sequence}`;
};

// 工具函数：格式化日期时间
const formatDateTime = (date: Date = new Date()): string => {
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

// 获取所有采购单
const getAllPurchases = (): PurchaseItem[] => {
  return getStorageData(STORAGE_KEYS.PURCHASE_LIST, []);
};

// 保存采购单列表
const savePurchaseList = (purchases: PurchaseItem[]): void => {
  setStorageData(STORAGE_KEYS.PURCHASE_LIST, purchases);
};

// 筛选和分页逻辑
const filterPurchases = (purchases: PurchaseItem[], params: PurchaseParams) => {
  let filtered = [...purchases];

  // 采购单号筛选
  if (params.purchase_no) {
    filtered = filtered.filter((item) =>
      item.purchase_no
        .toLowerCase()
        .includes(params.purchase_no!.toLowerCase()),
    );
  }

  // 日期范围筛选
  if (params.start_date) {
    filtered = filtered.filter(
      (item) => item.create_time >= params.start_date!,
    );
  }
  if (params.end_date) {
    filtered = filtered.filter(
      (item) => item.create_time <= params.end_date! + ' 23:59:59',
    );
  }

  // 门店筛选
  if (params.store_ids && params.store_ids.length > 0) {
    filtered = filtered.filter((item) =>
      params.store_ids!.includes(item.store_name),
    );
  }

  // 采购人筛选
  if (params.creator_name) {
    filtered = filtered.filter((item) =>
      item.creator_name
        .toLowerCase()
        .includes(params.creator_name!.toLowerCase()),
    );
  }

  // 状态筛选
  if (params.status_codes && params.status_codes.length > 0) {
    filtered = filtered.filter((item) =>
      params.status_codes!.includes(item.status.code),
    );
  }

  // 排除指定状态
  if (params.exclude_status !== undefined) {
    filtered = filtered.filter(
      (item) => item.status.code !== params.exclude_status,
    );
  }

  // 排序：按修改时间降序（最新的在最前面）
  filtered.sort((a, b) => {
    const timeA = new Date(a.modify_time).getTime();
    const timeB = new Date(b.modify_time).getTime();
    return timeB - timeA; // 降序排列
  });

  // 分页
  const page = params.page || 1;
  const pageSize = params.page_size || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize,
  };
};

// ======== 草稿相关功能（模拟 Redis 存储） ========

// 草稿数据结构
interface DraftPurchaseWithMeta extends PurchaseItem {
  expiresAt: string; // 过期时间
}

// 获取所有草稿（包含过期的）
const getAllDraftsRaw = (): DraftPurchaseWithMeta[] => {
  return getStorageData(STORAGE_KEYS.DRAFT_PURCHASES, []);
};

// 保存草稿列表
const saveDraftList = (drafts: DraftPurchaseWithMeta[]): void => {
  setStorageData(STORAGE_KEYS.DRAFT_PURCHASES, drafts);
};

// 清理过期的草稿（模拟 Redis TTL）
const cleanExpiredDrafts = (): void => {
  const drafts = getAllDraftsRaw();
  const now = new Date();
  const validDrafts = drafts.filter((draft) => new Date(draft.expiresAt) > now);

  if (validDrafts.length !== drafts.length) {
    console.log(`清理了 ${drafts.length - validDrafts.length} 个过期草稿`);
    saveDraftList(validDrafts);
  }
};

// 获取有效的草稿列表
const getValidDrafts = (): PurchaseItem[] => {
  cleanExpiredDrafts();
  const drafts = getAllDraftsRaw();
  // 移除 expiresAt 字段，返回标准的 PurchaseItem
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return drafts.map(({ expiresAt, ...draft }) => draft);
};

// 计算过期时间（1天后）
const calculateExpiresAt = (): string => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后
  return formatDateTime(expiresAt);
};

// 保存草稿到 Redis（模拟）
const saveDraft = (purchase: PurchaseItem): void => {
  const drafts = getAllDraftsRaw();
  const existingIndex = drafts.findIndex((d) => d.id === purchase.id);

  const draftWithMeta: DraftPurchaseWithMeta = {
    ...purchase,
    expiresAt: calculateExpiresAt(),
  };

  if (existingIndex >= 0) {
    // 更新现有草稿
    drafts[existingIndex] = draftWithMeta;
  } else {
    // 新增草稿
    drafts.push(draftWithMeta);
  }

  saveDraftList(drafts);
};

// 从 Redis 删除草稿
const deleteDraft = (purchaseId: string): void => {
  const drafts = getAllDraftsRaw();
  const filtered = drafts.filter((d) => d.id !== purchaseId);
  saveDraftList(filtered);
};

// 模拟异步请求的延迟
const delay = (ms: number = 300) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms));

export const PurchaseAPI = {
  // 获取草稿列表（从 Redis，模拟）
  getDraftPurchases: async (
    params: PurchaseParams,
  ): Promise<ResponseInfoType<PageInfo_PurchaseItem>> => {
    await delay(200); // 模拟 Redis 查询稍快一些

    // 自动清理过期草稿
    cleanExpiredDrafts();

    const drafts = getValidDrafts();
    const result = filterPurchases(drafts, params);

    console.log(`📝 从 Redis 获取草稿列表：共 ${result.total} 条`);

    return {
      response_status: {
        code: 200,
        msg: 'success',
        extension: { key: '', value: '' },
      },
      data: {
        purchase_list: result.list,
        meta: {
          total_count: result.total,
          total_page: Math.ceil(result.total / result.pageSize),
        },
      },
    };
  },

  getAllPurchases: async (
    params: PurchaseParams,
  ): Promise<ResponseInfoType<PageInfo_PurchaseItem>> => {
    await delay();
    const purchases = getAllPurchases();
    const result = filterPurchases(purchases, params);

    return {
      response_status: {
        code: 200,
        msg: 'success',
        extension: { key: '', value: '' },
      },
      data: {
        purchase_list: result.list,
        meta: {
          total_count: result.total,
          total_page: Math.ceil(result.total / result.pageSize),
        },
      },
    };
  },

  getPurchaseDetail: async (
    purchaseId: string,
  ): Promise<ResponseInfoType<PurchaseItem>> => {
    await delay();
    const purchases = getAllPurchases();
    const purchase = purchases.find((item) => item.id === purchaseId);

    if (purchase) {
      return {
        response_status: {
          code: 200,
          msg: 'success',
          extension: { key: '', value: '' },
        },
        data: purchase,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  createPurchase: async (
    params: CreatePurchaseParams,
  ): Promise<ResponseInfoType<PurchaseItem>> => {
    await delay();

    // 生成新的采购单详情ID
    const purchase_details = params.purchase_details.map((detail: any) => ({
      ...detail,
      id: generateId(),
    }));

    // 调试：打印配件类型信息
    console.log(
      '🔍 创建采购单 - 配件明细：',
      purchase_details.map((d) => ({
        part_name: d.part_name,
        category_type: d.category_type,
      })),
    );

    const newPurchase: PurchaseItem = {
      id: generateId(),
      purchase_no: generatePurchaseNo(),
      create_time: formatDateTime(),
      modify_time: formatDateTime(),
      store_name: '奥吉通4S店-默认店', // 这里应该从用户信息获取
      creator_name: '当前用户', // 这里应该从用户信息获取
      total_amount: 0, // 这里可以根据明细计算
      status: PurchaseStatusMap[1], // 草稿状态
      expected_delivery_date: params.expected_delivery_date,
      remark: params.remark || '',
      purchase_details,
    };

    // 保存到草稿（Redis），而不是正式的采购单列表
    saveDraft(newPurchase);

    console.log(
      `📝 新建草稿保存到 Redis：${
        newPurchase.purchase_no
      }，有效期至：${calculateExpiresAt()}`,
    );

    return {
      response_status: {
        code: 200,
        msg: '草稿已保存',
        extension: { key: '', value: '' },
      },
      data: newPurchase,
    };
  },

  updatePurchase: async (
    params: UpdatePurchaseParams,
  ): Promise<ResponseInfoType<PurchaseItem>> => {
    await delay();

    // 先从草稿中查找
    const drafts = getValidDrafts();
    const draftIndex = drafts.findIndex(
      (item) => item.id === params.purchase_id,
    );

    if (draftIndex !== -1) {
      // 更新草稿
      const purchase_details = params.purchase_details.map((detail: any) => ({
        ...detail,
        id: detail.id || generateId(),
      }));

      const updatedDraft: PurchaseItem = {
        ...drafts[draftIndex],
        expected_delivery_date: params.expected_delivery_date,
        remark: params.remark || '',
        modify_time: formatDateTime(),
        purchase_details,
      };

      saveDraft(updatedDraft);

      console.log(
        `📝 更新草稿到 Redis：${
          updatedDraft.purchase_no
        }，有效期延长至：${calculateExpiresAt()}`,
      );

      return {
        response_status: {
          code: 200,
          msg: '草稿已更新',
          extension: { key: '', value: '' },
        },
        data: updatedDraft,
      };
    }

    // 如果不是草稿，再从正式列表中查找
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === params.purchase_id);

    if (index !== -1) {
      // 更新正式采购单
      const purchase_details = params.purchase_details.map((detail: any) => ({
        ...detail,
        id: detail.id || generateId(),
      }));

      const updatedPurchase: PurchaseItem = {
        ...purchases[index],
        expected_delivery_date: params.expected_delivery_date,
        remark: params.remark || '',
        modify_time: formatDateTime(),
        purchase_details,
      };

      purchases[index] = updatedPurchase;
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '更新成功',
          extension: { key: '', value: '' },
        },
        data: updatedPurchase,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  deletePurchase: async (params: {
    purchase_id: string;
  }): Promise<ResponseInfoType<null>> => {
    await delay();

    // 先尝试从草稿中删除
    const drafts = getValidDrafts();
    const draftExists = drafts.some((item) => item.id === params.purchase_id);

    if (draftExists) {
      deleteDraft(params.purchase_id);
      console.log(`📝 从 Redis 删除草稿：${params.purchase_id}`);

      return {
        response_status: {
          code: 200,
          msg: '草稿已删除',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    }

    // 如果不是草稿，从正式列表中删除
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === params.purchase_id);

    if (index !== -1) {
      purchases.splice(index, 1);
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '删除成功',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  submitPurchase: async (
    purchaseId: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();

    // 从草稿中查找
    const drafts = getValidDrafts();
    const draft = drafts.find((item) => item.id === purchaseId);

    if (draft) {
      // 草稿提交：从 Redis 移除，保存到数据库，直接进入待询价状态
      const submittedPurchase: PurchaseItem = {
        ...draft,
        status: PurchaseStatusMap[2], // 待询价（新流程：跳过审核直接询价）
        modify_time: formatDateTime(),
      };

      // 从 Redis 删除草稿
      deleteDraft(purchaseId);

      // 保存到数据库
      const purchases = getAllPurchases();
      purchases.push(submittedPurchase);
      savePurchaseList(purchases);

      console.log(
        `✅ 草稿提交成功：${draft.purchase_no} - 从 Redis 移除，进入待询价状态`,
      );

      return {
        response_status: {
          code: 200,
          msg: '提交成功，系统将自动向供应商发送询价',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    }

    // 如果不是草稿（重新提交的情况已不存在，因为取消了驳回状态）
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === purchaseId);

    if (index !== -1) {
      purchases[index].status = PurchaseStatusMap[2]; // 待询价
      purchases[index].modify_time = formatDateTime();
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '提交成功，系统将自动向供应商发送询价',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 【已删除】approvePurchase - 第一轮采购单审核已取消
  // 新流程：草稿提交后直接进入待询价状态

  // 【已删除】rejectPurchase - 第一轮采购单审核已取消
  // 新流程：草稿提交后直接进入待询价状态

  // 【新增】价格审批通过
  approvePriceRequest: async (
    purchaseId: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === purchaseId);

    if (index !== -1) {
      if (purchases[index].status.code !== 4) {
        throw new Error('当前采购单不在价格待审批状态');
      }

      purchases[index].status = PurchaseStatusMap[3]; // 回到已报价状态，可以提交订单
      purchases[index].modify_time = formatDateTime();
      savePurchaseList(purchases);

      console.log('✅ 价格审批通过 → 已报价（可提交订单）');

      return {
        response_status: {
          code: 200,
          msg: '价格审批通过，可以提交订单',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 【新增】价格审批驳回
  rejectPriceRequest: async (
    purchaseId: string,
    reason: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === purchaseId);

    if (index !== -1) {
      if (purchases[index].status.code !== 4) {
        throw new Error('当前采购单不在价格待审批状态');
      }

      purchases[index].status = PurchaseStatusMap[2]; // 待询价（重新询价）
      purchases[index].modify_time = formatDateTime();
      purchases[index].remark = `${
        purchases[index].remark || ''
      }\n价格审批驳回原因：${reason}`;
      savePurchaseList(purchases);

      // 清除之前的报价数据
      const quotesData: any = getStorageData(STORAGE_KEYS.QUOTES_DATA, {});
      if (quotesData[purchaseId]) {
        delete quotesData[purchaseId];
        setStorageData(STORAGE_KEYS.QUOTES_DATA, quotesData);
      }

      console.log('❌ 价格审批驳回 → 重新询价');

      return {
        response_status: {
          code: 200,
          msg: '价格审批驳回，需重新询价',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 获取采购单的报价数据
  getPurchaseQuotes: async (
    purchaseId: string,
  ): Promise<ResponseInfoType<any[]>> => {
    await delay();
    const quotesData: any = getStorageData(STORAGE_KEYS.QUOTES_DATA, {});
    const purchaseQuotes = quotesData[purchaseId] || [];

    return {
      response_status: {
        code: 200,
        msg: 'success',
        extension: { key: '', value: '' },
      },
      data: purchaseQuotes,
    };
  },

  // 提交/更新报价
  submitQuote: async (
    purchaseId: string,
    supplierId: string,
    quoteData: any,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const quotesData: any = getStorageData(STORAGE_KEYS.QUOTES_DATA, {});

    if (!quotesData[purchaseId]) {
      quotesData[purchaseId] = [];
    }

    const existingQuoteIndex = quotesData[purchaseId].findIndex(
      (q: any) => q.supplier_id === supplierId,
    );

    if (existingQuoteIndex >= 0) {
      // 更新现有报价
      quotesData[purchaseId][existingQuoteIndex] = {
        ...quotesData[purchaseId][existingQuoteIndex],
        ...quoteData,
        quote_date: formatDateTime(),
      };
    } else {
      // 新增报价
      quotesData[purchaseId].push({
        supplier_id: supplierId,
        ...quoteData,
        quote_date: formatDateTime(),
        status: 'quoted',
      });
    }

    setStorageData(STORAGE_KEYS.QUOTES_DATA, quotesData);

    return {
      response_status: {
        code: 200,
        msg: '报价提交成功',
        extension: { key: '', value: '' },
      },
      data: null,
    };
  },

  // 选择供应商
  selectSupplier: async (
    purchaseId: string,
    supplierId: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const quotesData: any = getStorageData(STORAGE_KEYS.QUOTES_DATA, {});

    // 获取选中的供应商报价
    let selectedQuote: any = null;
    if (quotesData[purchaseId]) {
      quotesData[purchaseId].forEach((quote: any) => {
        quote.status = quote.supplier_id === supplierId ? 'selected' : 'quoted';
        if (quote.supplier_id === supplierId) {
          selectedQuote = quote;
        }
      });
      setStorageData(STORAGE_KEYS.QUOTES_DATA, quotesData);
    }

    // 更新采购单状态和总金额
    const purchases = getAllPurchases();
    const purchaseIndex = purchases.findIndex((item) => item.id === purchaseId);
    if (purchaseIndex !== -1) {
      const purchase = purchases[purchaseIndex];

      // 更新总金额
      if (selectedQuote && selectedQuote.total_amount) {
        purchases[purchaseIndex].total_amount = selectedQuote.total_amount;
        console.log(
          `💰 更新采购单总金额：¥${selectedQuote.total_amount.toFixed(2)}`,
        );
      }

      // 【新增】价格审批机制：检查报价是否超过历史均价
      let needsPriceApproval = false;
      const priceThreshold = 1.15; // 超过历史均价15%需要审批

      for (const detail of purchase.purchase_details) {
        if (detail.historical_avg_price && detail.historical_avg_price > 0) {
          // 从报价中找到对应配件的报价单价
          const quoteItem = selectedQuote?.part_quotes?.find(
            (pq: any) => pq.part_id === detail.id,
          );
          if (
            quoteItem &&
            quoteItem.unit_price > detail.historical_avg_price * priceThreshold
          ) {
            needsPriceApproval = true;
            console.log(
              `⚠️ 价格超标：${detail.part_name} 报价¥${quoteItem.unit_price} > 历史均价¥${detail.historical_avg_price} * ${priceThreshold}`,
            );
            break;
          }
        }
      }

      // 根据价格检查结果设置状态
      if (needsPriceApproval) {
        purchases[purchaseIndex].status = PurchaseStatusMap[4]; // 价格待审批
        purchases[purchaseIndex].modify_time = formatDateTime();
        savePurchaseList(purchases);

        console.log('⚠️ 报价超过历史均价，需要价格审批');

        return {
          response_status: {
            code: 200,
            msg: '供应商选择成功，报价超过历史均价，需提交价格审批',
            extension: { key: '', value: '' },
          },
          data: null,
        };
      } else {
        purchases[purchaseIndex].status = PurchaseStatusMap[3]; // 已报价
        purchases[purchaseIndex].modify_time = formatDateTime();
        savePurchaseList(purchases);

        console.log('✅ 价格正常，供应商选择成功');

        return {
          response_status: {
            code: 200,
            msg: '供应商选择成功',
            extension: { key: '', value: '' },
          },
          data: null,
        };
      }
    }

    return {
      response_status: {
        code: 200,
        msg: '供应商选择成功',
        extension: { key: '', value: '' },
      },
      data: null,
    };
  },

  // 提交订单（原生成订单）
  submitOrder: async (purchaseId: string): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const purchaseIndex = purchases.findIndex((item) => item.id === purchaseId);

    if (purchaseIndex !== -1) {
      purchases[purchaseIndex].status = PurchaseStatusMap[5]; // 已下单（新流程：无需审核）
      purchases[purchaseIndex].modify_time = formatDateTime();
      savePurchaseList(purchases);

      console.log('✅ 订单提交成功 → 已下单（无需审核）');

      return {
        response_status: {
          code: 200,
          msg: '订单提交成功，已通知供应商发货',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 【已删除】approveOrder - 订单审核已取消
  // 新流程：提交订单后直接变为已下单状态

  // 【已删除】rejectOrder - 订单审核已取消
  // 新流程：提交订单后直接变为已下单状态

  // 【新增】确认到货
  confirmArrival: async (
    purchaseId: string,
    arrivalDate: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const purchaseIndex = purchases.findIndex((item) => item.id === purchaseId);

    if (purchaseIndex !== -1) {
      const purchase = purchases[purchaseIndex];

      if (purchase.status.code !== 5) {
        throw new Error('只有已下单状态的采购单才能确认到货');
      }

      // 计算交货周期（从下单到到货的天数）
      const orderTime = new Date(purchase.modify_time);
      const arrivalTime = new Date(arrivalDate);
      const deliveryCycle = Math.ceil(
        (arrivalTime.getTime() - orderTime.getTime()) / (1000 * 60 * 60 * 24),
      );

      purchases[purchaseIndex].status = PurchaseStatusMap[6]; // 已到货
      purchases[purchaseIndex].arrival_date = arrivalDate;
      purchases[purchaseIndex].arrival_confirm_time = formatDateTime();
      purchases[purchaseIndex].delivery_cycle = deliveryCycle;
      purchases[purchaseIndex].modify_time = formatDateTime();
      savePurchaseList(purchases);

      console.log(`✅ 确认到货成功，交货周期：${deliveryCycle}天`);

      return {
        response_status: {
          code: 200,
          msg: `到货确认成功，交货周期：${deliveryCycle}天`,
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 生成订单（保持兼容性）
  generateOrder: async (
    purchaseId: string,
  ): Promise<ResponseInfoType<null>> => {
    return PurchaseAPI.submitOrder(purchaseId);
  },
};
