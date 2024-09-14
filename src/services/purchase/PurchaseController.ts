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

// 模拟异步请求的延迟
// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const PurchaseAPI = {
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
    const purchases = getAllPurchases();

    // 生成新的采购单详情ID
    const purchase_details = params.purchase_details.map((detail: any) => ({
      ...detail,
      id: generateId(),
    }));

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

    purchases.push(newPurchase);
    savePurchaseList(purchases);

    return {
      response_status: {
        code: 200,
        msg: 'success',
        extension: { key: '', value: '' },
      },
      data: newPurchase,
    };
  },

  updatePurchase: async (
    params: UpdatePurchaseParams,
  ): Promise<ResponseInfoType<PurchaseItem>> => {
    await delay();
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === params.purchase_id);

    if (index !== -1) {
      // 更新采购单详情ID
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
          msg: 'success',
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
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === purchaseId);

    if (index !== -1) {
      purchases[index].status = PurchaseStatusMap[2]; // 待审核
      purchases[index].modify_time = formatDateTime();
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '提交成功',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  approvePurchase: async (
    purchaseId: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === purchaseId);

    if (index !== -1) {
      purchases[index].status = PurchaseStatusMap[5]; // 待询价
      purchases[index].modify_time = formatDateTime();
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '审核通过，进入询价流程',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  rejectPurchase: async (
    purchaseId: string,
    reason: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const index = purchases.findIndex((item) => item.id === purchaseId);

    if (index !== -1) {
      purchases[index].status = PurchaseStatusMap[4]; // 已驳回
      purchases[index].modify_time = formatDateTime();
      purchases[
        index
      ].remark = `${purchases[index].remark}\n驳回原因：${reason}`;
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '驳回成功',
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

    if (quotesData[purchaseId]) {
      quotesData[purchaseId].forEach((quote: any) => {
        quote.status = quote.supplier_id === supplierId ? 'selected' : 'quoted';
      });
      setStorageData(STORAGE_KEYS.QUOTES_DATA, quotesData);
    }

    // 同时更新采购单状态为已报价
    const purchases = getAllPurchases();
    const purchaseIndex = purchases.findIndex((item) => item.id === purchaseId);
    if (purchaseIndex !== -1) {
      purchases[purchaseIndex].status = PurchaseStatusMap[6]; // 已报价
      purchases[purchaseIndex].modify_time = formatDateTime();
      savePurchaseList(purchases);
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
      purchases[purchaseIndex].status = PurchaseStatusMap[7]; // 订单待审核
      purchases[purchaseIndex].modify_time = formatDateTime();
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '订单提交成功，待审核',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 审核订单通过
  approveOrder: async (purchaseId: string): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const purchaseIndex = purchases.findIndex((item) => item.id === purchaseId);

    if (purchaseIndex !== -1) {
      purchases[purchaseIndex].status = PurchaseStatusMap[8]; // 已下单
      purchases[purchaseIndex].modify_time = formatDateTime();
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '订单审核通过',
          extension: { key: '', value: '' },
        },
        data: null,
      };
    } else {
      throw new Error('采购单不存在');
    }
  },

  // 驳回订单
  rejectOrder: async (
    purchaseId: string,
    reason: string,
  ): Promise<ResponseInfoType<null>> => {
    await delay();
    const purchases = getAllPurchases();
    const purchaseIndex = purchases.findIndex((item) => item.id === purchaseId);

    if (purchaseIndex !== -1) {
      purchases[purchaseIndex].status = PurchaseStatusMap[6]; // 回到已报价状态
      purchases[purchaseIndex].modify_time = formatDateTime();
      purchases[
        purchaseIndex
      ].remark = `${purchases[purchaseIndex].remark}\n订单驳回原因：${reason}`;
      savePurchaseList(purchases);

      return {
        response_status: {
          code: 200,
          msg: '订单驳回成功',
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
