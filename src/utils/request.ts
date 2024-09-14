import { ResponseInfoType } from '@/types/common';

/**
 * 获取所有分页数据的通用方法
 * @param requestFn 请求函数
 * @param params 请求参数
 * @param options 配置选项
 * @returns 所有数据的数组
 */
export async function fetchAllPaginatedData<T, P extends object>(
  requestFn: (
    params: P &
      ({ page: number; limit: number } | { offset: number; limit: number }),
  ) => Promise<ResponseInfoType<any>>,
  params: P,
  options: {
    /** 每页数据量 */
    pageSize?: number;
    /** 返回数据的key */
    responseKey?: string;
    /** 是否使用offset分页 */
    useOffset?: boolean;
  } = {},
): Promise<T[]> {
  const {
    pageSize = 100,
    responseKey = 'record_list',
    useOffset = false,
  } = options;

  try {
    // 获取第一页数据和总页数
    const firstPageParams = useOffset
      ? { ...params, offset: 0, limit: pageSize }
      : { ...params, page: 1, limit: pageSize };

    const firstPageResponse = await requestFn(firstPageParams as any);

    let allRecords = [...firstPageResponse.data[responseKey]];
    const totalPage = firstPageResponse.data.meta.total_page;

    // 如果有多页，继续请求剩余页面的数据
    if (totalPage > 1) {
      const remainingRequests = Array.from(
        { length: totalPage - 1 },
        (_, i) => {
          const pageParams = useOffset
            ? { ...params, offset: (i + 1) * pageSize, limit: pageSize }
            : { ...params, page: i + 2, limit: pageSize };

          return requestFn(pageParams as any);
        },
      );

      const responses = await Promise.all(remainingRequests);
      responses.forEach((response) => {
        allRecords = [...allRecords, ...response.data[responseKey]];
      });
    }

    return allRecords;
  } catch (error) {
    console.error('获取分页数据失败:', error);
    throw error;
  }
}
