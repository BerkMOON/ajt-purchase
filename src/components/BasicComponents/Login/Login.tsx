import { Role } from '@/constants';
import { UserInfo } from '@/services/system/user/typings';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Dropdown } from 'antd';
import StoreSelector from '../StoreSelector';
import styles from './Login.scss';

const Login: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { clearCurrentStore } = useModel('storeModel');

  const goLogout = async () => {
    localStorage.removeItem('token');
    clearCurrentStore();
    localStorage.removeItem('currentSupplier');
    history.push('/login');
  };

  const items = [
    {
      key: '0',
      label: (
        <a
          type="link"
          onClick={() => {
            history.push('/user-info');
          }}
        >
          个人信息
        </a>
      ),
      icon: <UserOutlined />,
    },
    {
      key: '1',
      label: (
        <a target="_blank" onClick={goLogout}>
          退出登录
        </a>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <div className={styles['login-container']}>
      {(initialState as UserInfo)?.user_type === Role.Store && (
        <StoreSelector />
      )}
      <Dropdown menu={{ items }} placement="topLeft">
        <div className={styles['login-info']}>
          {(initialState as UserInfo)?.username}
        </div>
      </Dropdown>
    </div>
  );
};

export default Login;
