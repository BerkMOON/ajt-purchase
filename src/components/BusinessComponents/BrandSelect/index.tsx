import InfiniteSelect from '@/components/BasicComponents/InfiniteSelect';
import { COMMON_STATUS } from '@/constants';
import { PurchaseAPI } from '@/services/purchase';
import { BrandAPI } from '@/services/system/brand/BrandController';
import type { BrandDetailResponse } from '@/services/system/brand/typings';
import { DefaultOptionType } from 'antd/es/select';
import React from 'react';

interface BrandSelectProps {
  value?: string | number;
  onChange?: (value: string | number, option?: DefaultOptionType) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  status?: COMMON_STATUS; // 可选：筛选品牌状态，默认只显示启用的
  isPlatform?: boolean;
  mode?: 'multiple' | 'tags';
}

const BrandSelect: React.FC<BrandSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择品牌',
  disabled = false,
  style,
  status = COMMON_STATUS.ACTIVE,
  isPlatform = false,
  mode = undefined,
}) => {
  const fetchBrand = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const Api = isPlatform ? BrandAPI.getList : PurchaseAPI.getBrandList;

    const { data } = await Api({
      page,
      limit: pageSize,
      status,
    });

    return {
      list: data.brands || [],
      total: data.count?.total_count || 0,
    };
  };

  const formatOption = (brand: BrandDetailResponse) => ({
    label: brand.brand_name || '',
    value: brand.id,
  });

  return (
    <InfiniteSelect
      placeholder={placeholder}
      value={value}
      mode={mode}
      onChange={onChange}
      disabled={disabled}
      style={{ width: '100%', ...style }}
      fetchData={fetchBrand}
      formatOption={formatOption as any}
      allowClear
      showSearch
      optionFilterProp="label"
    />
  );
};

export default BrandSelect;
