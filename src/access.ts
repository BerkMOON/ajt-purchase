// import { Role } from './constants';
import { UserInfo } from './services/user/typings';

export default (initialState: UserInfo & { isLogin: boolean }) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access

  return {
    isLogin: !!initialState?.isLogin,
    purchaseList: !!initialState?.isLogin, // 这里可以根据实际需求调整
  };
};
