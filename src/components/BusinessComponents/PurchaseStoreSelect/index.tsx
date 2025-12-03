import { Role } from '@/constants';
import { StoreAPI } from '@/services/system/store/StoreController';
import type { StoreItem } from '@/services/system/store/typing';
import { UserInfo } from '@/services/system/user/typings';
import { useModel } from '@umijs/max';
import { Select } from 'antd';
import { FormInstance } from 'antd/es/form';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

interface PurchaseStoreSelectProps {
  form?: FormInstance;
  disabled?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  value?: number;
  onChange?: (value: number) => void;
  onInitialValueSet?: (value: number) => void;
}

const PurchaseStoreSelect: React.FC<PurchaseStoreSelectProps> = ({
  form,
  disabled = false,
  allowClear = true,
  placeholder = '请选择采购门店',
  style,
  value,
  onChange,
  onInitialValueSet,
}) => {
  const { initialState } = useModel('@@initialState');
  const user = (initialState || {}) as UserInfo & { isLogin: boolean };
  const isStoreUser = user.user_type === Role.Store;
  const [storeList, setStoreList] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      if (isStoreUser) {
        // 门店用户：从 initialState 中获取门店信息
        if (user.store_infos && user.store_infos.length > 0) {
          const stores = user.store_infos.map((store) => ({
            id: store.store_id,
            company_id: store.company_id,
            store_name: store.store_name,
            contacts: '',
            phone: '',
            email: '',
            address: '',
            remark: '',
            status: { code: 1, name: '生效' },
          }));
          setStoreList(stores);
          // 如果只有一个门店，自动选中且不可更改
          if (stores.length === 1 && form) {
            form.setFieldsValue({ store_id: stores[0].id });
            if (onInitialValueSet) {
              onInitialValueSet(stores[0].id);
            }
          }
        }
      } else {
        // 平台用户：通过 getAllStores 获取门店列表
        setLoading(true);
        try {
          const response = await StoreAPI.getAllStores({
            page: 1,
            limit: 100,
            company_id: '',
          });
          if (response.data?.stores) {
            setStoreList(response.data.stores);
          }
        } catch (error) {
          console.error('获取门店列表失败', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStores();
  }, [isStoreUser, user.store_infos, form, onInitialValueSet]);

  // 门店用户且只有一个门店时，禁用选择
  const isDisabled = disabled || (isStoreUser && storeList.length === 1);

  return (
    <Select
      placeholder={placeholder}
      allowClear={allowClear && !isStoreUser}
      showSearch
      disabled={isDisabled}
      loading={loading}
      value={value}
      onChange={onChange}
      style={{ width: '100%', ...style }}
      optionFilterProp="children"
      filterOption={(input, option) => {
        const text = String((option?.children as unknown) || '').toLowerCase();
        return text.includes(input.toLowerCase());
      }}
    >
      {storeList.map((store) => (
        <Option key={store.id} value={store.id}>
          {store.store_name}
        </Option>
      ))}
    </Select>
  );
};

export default PurchaseStoreSelect;
