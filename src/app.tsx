// 运行时配置
import { Button, message, Result } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import Login from './components/BasicComponents/Login/Login';
import iconPng from './favicon.jpeg';
import { UserInfo } from './services/system/user/typings';
import { UserAPI } from './services/system/user/UserController';
import type { ResponseInfoType } from './types/common';

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
      // 从localStorage获取token并添加到Authorization header
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      // 检查响应中的 response_status.code
      const data = response.data;
      if (data && typeof data === 'object' && 'response_status' in data) {
        const responseStatus = (data as ResponseInfoType<any>).response_status;
        if (responseStatus && responseStatus.code !== 200) {
          // 如果 response_status.code 不是 200，显示错误信息并抛出错误
          const errorMsg = responseStatus.msg || '请求失败';
          // message.error(errorMsg);
          // 抛出错误，让 errorHandler 处理
          const error = new Error(errorMsg);
          (error as any).response = {
            ...response,
            status: responseStatus.code,
          };
          (error as any).response_status = responseStatus;
          throw error;
        }
      }

      return response;
    },
  ],
  errorConfig: {
    errorHandler: (error: any) => {
      // 统一错误处理
      if (error.response?.status === 401) {
        // 清除token
        localStorage.removeItem('token');
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectPath', currentPath);
        // window.location.href = '/login';
      } else if (error.response_status) {
        // 如果已经有 response_status，说明已经在 responseInterceptors 中显示过错误信息了
        // 这里只记录日志，不再重复显示
        console.error('API 错误:', error.response_status);
      } else {
        // 其他类型的错误（网络错误、超时等）
        // 只有在没有 response_status 的情况下才显示错误，避免重复显示
        const errorMsg = error.message || '请求失败，请稍后重试';
        message.error(errorMsg);
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
