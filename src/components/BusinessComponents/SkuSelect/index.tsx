import { SkuAPI } from '@/services/sku';
import { SkuInfo } from '@/services/sku/typings';
import { Select, Spin } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { useEffect, useState } from 'react';

interface SkuSelectProps {
  value?: number;
  onChange?: (value: number, option?: DefaultOptionType) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  allowClear?: boolean;
  showSearch?: boolean;
}

const SkuSelect: React.FC<SkuSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择SKU',
  disabled = false,
  style,
  allowClear = true,
  showSearch = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ label: string; value: number }[]>(
    [],
  );

  useEffect(() => {
    const fetchSkus = async () => {
      setLoading(true);
      try {
        const response = await SkuAPI.getSkuList();
        if (response.response_status.code === 200 && response.data) {
          const skuOptions = response.data.list.map((sku: SkuInfo) => ({
            label: `${sku.sku_name}`,
            value: sku.sku_id,
            sku: sku, // 保存完整SKU信息，方便后续使用
          }));
          setOptions(skuOptions);
        }
      } catch (error) {
        console.error('获取SKU列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkus();
  }, []);

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%', ...style }}
      allowClear={allowClear}
      showSearch={showSearch}
      loading={loading}
      options={options}
      optionFilterProp="label"
      notFoundContent={loading ? <Spin size="small" /> : '暂无数据'}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

export default SkuSelect;
