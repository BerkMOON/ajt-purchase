import { SmileOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Result } from 'antd';

const Home = () => {
  const { isLogin } = useAccess();

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <Result
      icon={<SmileOutlined />}
      title="欢迎使用奥吉通集采系统"
      subTitle="请选择上方的菜单进行操作，若无权限请联系管理员"
    />
  );
};

export default Home;
