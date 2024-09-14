import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

interface InfiniteSelectProps<T> extends Omit<SelectProps, 'options'> {
  fetchData: (params: { page: number; pageSize: number }) => Promise<{
    list: T[];
    total: number;
  }>;
  formatOption: (item: T) => { label: string; value: string };
  pageSize?: number;
}

const InfiniteSelect = forwardRef(
  <T extends any>(
    {
      fetchData,
      formatOption,
      pageSize = 20,
      ...props
    }: InfiniteSelectProps<T>,
    ref: React.Ref<{ resetData: () => void }>,
  ) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<
      { label: string; value: string | number }[]
    >([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadData = async (currentPage: number) => {
      setLoading(true);
      try {
        const { list, total } = await fetchData({
          page: currentPage,
          pageSize,
        });

        const newOptions = list.map(formatOption);

        if (currentPage === 1) {
          setOptions(newOptions);
        } else {
          setOptions((prev) => [...prev, ...newOptions]);
        }

        setHasMore(options.length + newOptions.length < total);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const resetData = () => {
      setPage(1);
      setOptions([]);
      setHasMore(true);
      loadData(1);
    };

    // 暴露重置方法
    useImperativeHandle(ref, () => ({
      resetData,
    }));

    useEffect(() => {
      loadData(1);
    }, []);

    const handlePopupScroll = debounce((e: React.UIEvent<HTMLDivElement>) => {
      const { target } = e;
      const { scrollTop, clientHeight, scrollHeight } =
        target as HTMLDivElement;

      if (scrollHeight - scrollTop <= clientHeight + 50) {
        if (!loading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadData(nextPage);
        }
      }
    }, 100);

    const dropdownRender = (menu: React.ReactElement) => (
      <>
        {menu}
        {loading && (
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <Spin size="small" />
          </div>
        )}
      </>
    );

    return (
      <Select
        {...props}
        loading={loading}
        options={options}
        onPopupScroll={handlePopupScroll}
        notFoundContent={loading ? <Spin size="small" /> : null}
        dropdownRender={dropdownRender}
      />
    );
  },
);

export default InfiniteSelect;
