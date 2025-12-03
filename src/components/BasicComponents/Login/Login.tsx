import { UserInfo } from '@/services/system/user/typings';
import { LogoutOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Dropdown } from 'antd';
import styles from './Login.scss';

const Login: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  const goLogout = async () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  const items = [
    {
      key: '1',
      label: (
        <a
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
            goLogout();
          }}
        >
          退出登录
        </a>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  const goUserInfo = () => {
    history.push('/user-info');
  };

  return (
    <div
      className={styles['login-container']}
      onClick={(e) => {
        e.preventDefault();
        goUserInfo();
      }}
    >
      <Dropdown menu={{ items }} placement="topLeft">
        <div className={styles['login-info']}>
          {(initialState as UserInfo)?.username}
        </div>
      </Dropdown>
    </div>
  );
};

export default Login;
