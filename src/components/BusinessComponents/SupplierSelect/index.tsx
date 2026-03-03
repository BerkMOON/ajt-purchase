import InfiniteSelect from '@/components/BasicComponents/InfiniteSelect';
import { COMMON_STATUS } from '@/constants';
import { SupplierAPI } from '@/services/system/supplier/supplierController';
import type { SupplierInfo } from '@/services/system/supplier/typings';
import type { DefaultOptionType } from 'antd/es/select';
import React from 'react';

interface SupplierSelectProps {
  value?: string | number;
  onChange?: (value: string | number, option?: DefaultOptionType) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const SupplierSelect: React.FC<SupplierSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择供应商',
  disabled = false,
  style,
}) => {
  const fetchSuppliers = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const { data } = await SupplierAPI.getSupplierList({
      page,
      limit: pageSize,
      status: COMMON_STATUS.ACTIVE,
    });

    return {
      list: data.suppliers || [],
      total: data.count?.total_count || 0,
    };
  };

  const formatOption = (supplier: SupplierInfo) => ({
    label: supplier.supplier_name,
    value: supplier.id,
  });

  return (
    <InfiniteSelect
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: '100%', ...style }}
      fetchData={fetchSuppliers}
      formatOption={formatOption as any}
      allowClear
      showSearch
      optionFilterProp="label"
    />
  );
};

export default SupplierSelect;
