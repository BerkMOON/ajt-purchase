import { UserInfo } from '@/services/user/typings';
import { DownOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Dropdown } from 'antd';
import React from 'react';
import styles from './index.scss';

const StoreSelector: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentStore, updateCurrentStore } = useModel('storeModel');

  if (!initialState?.isLogin) return null;

  const userInfo = initialState as UserInfo & { isLogin: boolean };
  const roleList = userInfo.role_list || [];

  const handleMenuClick = ({ key }: { key: string }) => {
    const [companyId, storeId] = key.split('-');
    const selectedRole = roleList.find(
      (role) =>
        role.company_id === Number(companyId) &&
        role.store_id === Number(storeId),
    );
    if (selectedRole) {
      updateCurrentStore(selectedRole);
      // 刷新页面以应用新的header
      window.location.reload();
    }
  };

  const items = roleList.map((role) => ({
    key: `${role.company_id}-${role.store_id}`,
    label: `${role.company_name} - ${role.store_name}`,
  }));

  const currentLabel = currentStore
    ? `${currentStore.companyName} - ${currentStore.storeName}`
    : roleList[0]
    ? `${roleList[0].company_name} - ${roleList[0].store_name}`
    : '选择门店';

  return (
    <div className={styles.storeSelector}>
      {roleList.length <= 1 ? (
        <Button type="text" className={styles.selector}>
          {currentLabel}
        </Button>
      ) : (
        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <Button type="text" className={styles.selector}>
            {currentLabel} <DownOutlined />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export default StoreSelector;
