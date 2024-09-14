import { UserInfo } from '@/services/user/typings';
import { UserAPI } from '@/services/user/UserController';
import { LogoutOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Dropdown } from 'antd';
import StoreSelector from '../StoreSelector';
import styles from './Login.scss';

const Login: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  const goLogout = async () => {
    await UserAPI.logout();
    history.push('/login');
  };

  const items = [
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
      <StoreSelector />
      <Dropdown menu={{ items }} placement="topLeft">
        <div className={styles['login-info']}>
          {(initialState as UserInfo)?.username}
        </div>
      </Dropdown>
    </div>
  );
};

export default Login;
