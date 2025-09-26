import { CatalogAPI } from '@/services/catalog/CatalogController';
import {
  AccessoryInfo,
  CategoryType,
  PartsInfo,
  StockStatus,
} from '@/services/purchase/typings.d';
import { message } from 'antd';
import { useEffect, useState } from 'react';

interface SearchParams {
  category_type: CategoryType;
  keyword: string;
  supplier_id: string;
  stock_status: StockStatus | undefined;
  page: number;
  page_size: number;
}

export const usePartSearch = () => {
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<(PartsInfo | AccessoryInfo)[]>([]);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    category_type: CategoryType.PARTS,
    keyword: '',
    supplier_id: '',
    stock_status: undefined,
    page: 1,
    page_size: 10,
  });

  // 获取配件列表
  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await CatalogAPI.getCatalog(searchParams);
      setParts(response.data.part_list);
    } catch (error) {
      message.error('获取配件列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [searchParams]);

  // 切换商品类型
  const handleTabChange = (key: string) => {
    setSearchParams({
      ...searchParams,
      category_type: key as CategoryType,
      page: 1,
      keyword: '',
      supplier_id: '',
      stock_status: undefined,
    });
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchParams({
      ...searchParams,
      keyword: value,
      page: 1,
    });
  };

  // 更新搜索参数
  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    setSearchParams({
      ...searchParams,
      ...newParams,
    });
  };

  return {
    loading,
    parts,
    searchParams,
    handleTabChange,
    handleSearch,
    updateSearchParams,
  };
};
