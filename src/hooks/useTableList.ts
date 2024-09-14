import { useCallback, useState } from 'react';

interface PageInfo {
  page: number;
  limit: number;
  total: number;
}

interface UseTableListProps<T> {
  fetchData: (params: { page: number; limit: number }) => Promise<{
    list: T[];
    total: number;
  }>;
  defaultPageSize?: number;
}

export function useTableList<T>({
  fetchData,
  defaultPageSize = 10,
}: UseTableListProps<T>) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T[]>();
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    page: 1,
    limit: defaultPageSize,
    total: 0,
  });

  const getData = useCallback(
    async (currentPage?: number, currentLimit?: number) => {
      setLoading(true);
      try {
        const result = await fetchData({
          page: currentPage || pageInfo.page,
          limit: currentLimit || pageInfo.limit,
        });
        setData(result.list);
        setPageInfo((prev) => ({
          ...prev,
          page: currentPage || prev.page,
          limit: currentLimit || prev.limit,
          total: result.total,
        }));
      } finally {
        setLoading(false);
      }
    },
    [fetchData],
  );

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      getData(page, pageSize);
    },
    [getData],
  );

  return {
    loading,
    data,
    pageInfo,
    getData,
    handlePageChange,
  };
}
