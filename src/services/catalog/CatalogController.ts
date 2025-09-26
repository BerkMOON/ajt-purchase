import type { ResponseInfoType } from '@/types/common';
import type {
  AccessoryInfo,
  CategoryType,
  PageInfo_PartCatalog,
  PartCatalogParams,
  PartCategory,
  PartsInfo,
  StockStatus,
} from '../purchase/typings';

// localStorage存储键名
const STORAGE_KEYS = {
  PART_CATEGORIES: 'ajt_part_categories',
  PARTS_CATALOG: 'ajt_parts_catalog',
  ACCESSORIES_CATALOG: 'ajt_accessories_catalog',
  CATALOG_COUNTER: 'ajt_catalog_counter',
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

// 工具函数：格式化日期时间
const formatDateTime = (date: Date = new Date()): string => {
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

// 模拟异步请求的延迟
const delay = (ms: number = 300) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms));

// 初始化分类数据
const initializeCategories = (): PartCategory[] => {
  return [
    // 备件分类
    {
      id: '1',
      name: '发动机系统',
      category_type: 'PARTS' as CategoryType,
      path: '备件>发动机系统',
      level: 2,
      sort_order: 1,
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: '制动系统',
      category_type: 'PARTS' as CategoryType,
      path: '备件>制动系统',
      level: 2,
      sort_order: 2,
      status: 'ACTIVE',
    },
    {
      id: '3',
      name: '传动系统',
      category_type: 'PARTS' as CategoryType,
      path: '备件>传动系统',
      level: 2,
      sort_order: 3,
      status: 'ACTIVE',
    },
    // 精品分类
    {
      id: '4',
      name: '车内饰品',
      category_type: 'ACCESSORIES' as CategoryType,
      path: '精品>车内饰品',
      level: 2,
      sort_order: 1,
      status: 'ACTIVE',
    },
    {
      id: '5',
      name: '车外装饰',
      category_type: 'ACCESSORIES' as CategoryType,
      path: '精品>车外装饰',
      level: 2,
      sort_order: 2,
      status: 'ACTIVE',
    },
    {
      id: '6',
      name: '电子设备',
      category_type: 'ACCESSORIES' as CategoryType,
      path: '精品>电子设备',
      level: 2,
      sort_order: 3,
      status: 'ACTIVE',
    },
  ];
};

// 初始化备件数据
const initializeParts = (): PartsInfo[] => {
  return [
    {
      part_id: 'P001',
      part_code: 'ENG001',
      part_name: '机油滤清器',
      category_type: 'PARTS' as CategoryType,
      category_path: '备件>发动机系统>机油滤清器',
      specification: '标准型',
      unit: '个',
      description: '适用于日常保养的标准机油滤清器',
      brand: '博世',
      create_time: formatDateTime(),
      status: 'ACTIVE',
      oem_number: 'OF001',
      applicable_models: ['奥迪A4', '奥迪A6', '大众迈腾'],
      historical_avg_price: 45.0,
      min_suppliers: 3,
      price_validity_days: 30,
    },
    {
      part_id: 'P002',
      part_code: 'BRK001',
      part_name: '前刹车片',
      category_type: 'PARTS' as CategoryType,
      category_path: '备件>制动系统>刹车片',
      specification: '陶瓷型',
      unit: '套',
      description: '高性能陶瓷刹车片，制动效果好',
      brand: 'Brembo',
      create_time: formatDateTime(),
      status: 'ACTIVE',
      oem_number: 'BP001',
      applicable_models: ['奥迪A4', '奥迪Q5'],
      historical_avg_price: 280.0,
      min_suppliers: 2,
      price_validity_days: 30,
    },
    {
      part_id: 'P003',
      part_code: 'TRN001',
      part_name: '变速箱油',
      category_type: 'PARTS' as CategoryType,
      category_path: '备件>传动系统>变速箱油',
      specification: 'ATF II',
      unit: '升',
      description: '自动变速箱专用油',
      brand: '美孚',
      create_time: formatDateTime(),
      status: 'ACTIVE',
      oem_number: 'TO001',
      applicable_models: ['奥迪A4', '奥迪A6', '奥迪Q5', '大众迈腾'],
      historical_avg_price: 120.0,
      min_suppliers: 4,
      price_validity_days: 60,
    },
  ];
};

// 初始化精品数据
const initializeAccessories = (): AccessoryInfo[] => {
  return [
    {
      part_id: 'A001',
      part_code: 'MAT001',
      part_name: '全包围脚垫',
      category_type: 'ACCESSORIES' as CategoryType,
      category_path: '精品>车内饰品>脚垫系列',
      specification: '真皮材质',
      unit: '套',
      description: '高档真皮全包围脚垫，防水防污',
      brand: '3M',
      create_time: formatDateTime(),
      status: 'ACTIVE',
      supplier_id: '1',
      supplier_name: '北京汽配供应商',
      supplier_part_code: 'BJ-MAT001',
      fixed_price: 680.0,
      price_update_time: formatDateTime(),
      min_order_quantity: 1,
      stock_status: 'IN_STOCK' as StockStatus,
    },
    {
      part_id: 'A002',
      part_code: 'FILM001',
      part_name: '车窗贴膜',
      category_type: 'ACCESSORIES' as CategoryType,
      category_path: '精品>车外装饰>车膜系列',
      specification: '3M晶锐70',
      unit: '套',
      description: '3M原厂车膜，隔热性能优异',
      brand: '3M',
      create_time: formatDateTime(),
      status: 'ACTIVE',
      supplier_id: '2',
      supplier_name: '上海零部件公司',
      supplier_part_code: 'SH-FILM001',
      fixed_price: 1200.0,
      price_update_time: formatDateTime(),
      min_order_quantity: 1,
      stock_status: 'IN_STOCK' as StockStatus,
    },
    {
      part_id: 'A003',
      part_code: 'DVR001',
      part_name: '行车记录仪',
      category_type: 'ACCESSORIES' as CategoryType,
      category_path: '精品>电子设备>行车记录仪',
      specification: '4K高清双镜头',
      unit: '台',
      description: '前后双镜头4K行车记录仪，夜视功能强',
      brand: '盯盯拍',
      create_time: formatDateTime(),
      status: 'ACTIVE',
      supplier_id: '3',
      supplier_name: '广州配件批发商',
      supplier_part_code: 'GZ-DVR001',
      fixed_price: 450.0,
      price_update_time: formatDateTime(),
      min_order_quantity: 1,
      stock_status: 'IN_STOCK' as StockStatus,
    },
  ];
};

// 筛选和分页逻辑
const filterCatalog = (
  parts: (PartsInfo | AccessoryInfo)[],
  params: PartCatalogParams,
) => {
  let filtered = [...parts];

  // 商品类型筛选
  if (params.category_type) {
    filtered = filtered.filter(
      (item) => item.category_type === params.category_type,
    );
  }

  // 关键词搜索
  if (params.keyword) {
    filtered = filtered.filter(
      (item) =>
        item.part_name.toLowerCase().includes(params.keyword!.toLowerCase()) ||
        item.part_code.toLowerCase().includes(params.keyword!.toLowerCase()) ||
        item.specification
          .toLowerCase()
          .includes(params.keyword!.toLowerCase()),
    );
  }

  // 供应商筛选（仅对精品有效）
  if (params.supplier_id) {
    filtered = filtered.filter(
      (item) =>
        item.category_type === 'ACCESSORIES' &&
        (item as AccessoryInfo).supplier_id === params.supplier_id,
    );
  }

  // 库存状态筛选（仅对精品有效）
  if (params.stock_status) {
    filtered = filtered.filter(
      (item) =>
        item.category_type === 'ACCESSORIES' &&
        (item as AccessoryInfo).stock_status === params.stock_status,
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

export const CatalogAPI = {
  // 获取分类列表
  getCategories: async (
    categoryType?: CategoryType,
  ): Promise<ResponseInfoType<PartCategory[]>> => {
    await delay();
    let categories = getStorageData(STORAGE_KEYS.PART_CATEGORIES, []);

    // 如果没有数据，初始化
    if (categories.length === 0) {
      categories = initializeCategories();
      setStorageData(STORAGE_KEYS.PART_CATEGORIES, categories);
    }

    // 按类型筛选
    if (categoryType) {
      categories = categories.filter(
        (cat: PartCategory) => cat.category_type === categoryType,
      );
    }

    return {
      response_status: {
        code: 200,
        msg: 'success',
        extension: { key: '', value: '' },
      },
      data: categories,
    };
  },

  // 获取配件目录列表
  getCatalog: async (
    params: PartCatalogParams,
  ): Promise<ResponseInfoType<PageInfo_PartCatalog>> => {
    await delay();

    // 获取备件和精品数据
    let parts = getStorageData(STORAGE_KEYS.PARTS_CATALOG, []);
    let accessories = getStorageData(STORAGE_KEYS.ACCESSORIES_CATALOG, []);

    // 如果没有数据，初始化
    if (parts.length === 0) {
      parts = initializeParts();
      setStorageData(STORAGE_KEYS.PARTS_CATALOG, parts);
    }
    if (accessories.length === 0) {
      accessories = initializeAccessories();
      setStorageData(STORAGE_KEYS.ACCESSORIES_CATALOG, accessories);
    }

    // 合并数据
    const allParts: (PartsInfo | AccessoryInfo)[] = [...parts, ...accessories];
    const result = filterCatalog(allParts, params);

    return {
      response_status: {
        code: 200,
        msg: 'success',
        extension: { key: '', value: '' },
      },
      data: {
        part_list: result.list,
        meta: {
          total_count: result.total,
          total_page: Math.ceil(result.total / result.pageSize),
        },
      },
    };
  },

  // 根据ID获取配件详情
  getPartDetail: async (
    partId: string,
  ): Promise<ResponseInfoType<PartsInfo | AccessoryInfo>> => {
    await delay();

    const parts = getStorageData(STORAGE_KEYS.PARTS_CATALOG, initializeParts());
    const accessories = getStorageData(
      STORAGE_KEYS.ACCESSORIES_CATALOG,
      initializeAccessories(),
    );

    const allParts: (PartsInfo | AccessoryInfo)[] = [...parts, ...accessories];
    const part = allParts.find((item) => item.part_id === partId);

    if (part) {
      return {
        response_status: {
          code: 200,
          msg: 'success',
          extension: { key: '', value: '' },
        },
        data: part,
      };
    } else {
      throw new Error('配件不存在');
    }
  },
};
