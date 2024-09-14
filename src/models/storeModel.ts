import { RoleList } from '@/services/user/typings';
import { useCallback, useState } from 'react';

export interface CurrentStore {
  companyId: number;
  companyName: string;
  storeId: number;
  storeName: string;
}

export default () => {
  const [currentStore, setCurrentStore] = useState<CurrentStore | null>(() => {
    // 从localStorage读取保存的选择，如果没有则返回null
    const saved = localStorage.getItem('currentStore');
    return saved ? JSON.parse(saved) : null;
  });

  const updateCurrentStore = useCallback((roleItem: RoleList) => {
    const newStore: CurrentStore = {
      companyId: roleItem.company_id,
      companyName: roleItem.company_name,
      storeId: roleItem.store_id,
      storeName: roleItem.store_name,
    };
    setCurrentStore(newStore);
    // 保存到localStorage
    localStorage.setItem('currentStore', JSON.stringify(newStore));
  }, []);

  const initializeCurrentStore = useCallback(
    (roleList: RoleList[]) => {
      // 如果没有当前选择，默认选择第一个
      if (!currentStore && roleList.length > 0) {
        updateCurrentStore(roleList[0]);
      }
    },
    [currentStore, updateCurrentStore],
  );

  return {
    currentStore,
    updateCurrentStore,
    initializeCurrentStore,
  };
};
