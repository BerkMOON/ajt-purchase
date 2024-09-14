// 运行时配置
import { Button, Result } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import Login from './components/BasicComponents/Login/Login';
import iconPng from './favicon.jpeg';
import { UserInfo } from './services/user/typings';
import { UserAPI } from './services/user/UserController';

dayjs.extend(isoWeek);
// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<
  (UserInfo & { isLogin: boolean }) | { isLogin: boolean }
> {
  // 在登录页面不请求用户信息
  if (window.location.pathname === '/login') {
    return { isLogin: false };
  }
  try {
    const userInfo = await UserAPI.getUserDetail();
    const { data } = userInfo;
    if (data) {
      // 如果用户有角色列表且没有保存的当前门店，初始化默认选择第一个
      if (data.role_list && data.role_list.length > 0) {
        const saved = localStorage.getItem('currentStore');
        if (!saved) {
          const firstRole = data.role_list[0];
          const defaultStore = {
            companyId: firstRole.company_id,
            companyName: firstRole.company_name,
            storeId: firstRole.store_id,
            storeName: firstRole.store_name,
          };
          localStorage.setItem('currentStore', JSON.stringify(defaultStore));
        } else {
          const parsed = JSON.parse(saved);
          const match = data.role_list.find(
            (role) =>
              role.company_id === parsed.companyId &&
              role.store_id === parsed.storeId,
          );
          if (!match) {
            const firstRole = data.role_list[0];
            const defaultStore = {
              companyId: firstRole.company_id,
              companyName: firstRole.company_name,
              storeId: firstRole.store_id,
              storeName: firstRole.store_name,
            };
            localStorage.setItem('currentStore', JSON.stringify(defaultStore));
          }
        }
      }
      return { ...data, isLogin: true };
    } else {
      return { isLogin: false };
    }
  } catch (e) {
    console.error('get user info error', e);
    return { isLogin: false };
  }
}

export const request = {
  timeout: 10000,
  requestInterceptors: [
    (config: any) => {
      // 只对自己的API添加自定义header，跳过第三方API
      const url = config.url || '';
      const isThirdPartyAPI = url.includes('amap.com');
      if (!isThirdPartyAPI || url.includes(window.location.host)) {
        // 从localStorage获取当前选中的门店和公司信息
        const currentStore = localStorage.getItem('currentStore');
        if (currentStore) {
          const store = JSON.parse(currentStore);
          config.headers = {
            ...config.headers,
            'X-Company-Id': store.companyId,
            'X-Store-Id': store.storeId,
          };
        }
      }
      return config;
    },
  ],
  errorConfig: {
    errorHandler: (error: any) => {
      // 统一错误处理
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectPath', currentPath);
        window.location.href = '/login';
      }
    },
  },
};

export const layout = ({
  initialState,
}: {
  initialState: (UserInfo & { isLogin: boolean }) | { isLogin: boolean };
}) => {
  const { isLogin } = initialState;
  return {
    logo: iconPng,
    menu: {
      locale: false,
    },
    rightContentRender: () => <Login />,
    layout: 'top',
    unAccessible: (
      <Result
        status={`${isLogin ? '403' : '404'}`}
        title={`${isLogin ? '403' : '未登录'}`}
        subTitle={
          isLogin
            ? '抱歉，你无权访问此页面，如需使用，请联系管理员添加权限'
            : '请先登录再查看'
        }
        extra={
          <Button
            type="primary"
            onClick={() => {
              if (isLogin) {
                window.location.href = '/home';
              } else {
                window.location.href = '/login';
              }
            }}
          >
            {isLogin ? '返回首页' : '登录'}
          </Button>
        }
      />
    ),
  };
};
