import { Role } from './constants';
import { UserInfo } from './services/system/user/typings';

export default (initialState: UserInfo & { isLogin: boolean }) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access

  const userType = initialState?.user_type;
  const roleKey = initialState?.role_key;
  const isLogin = !!initialState?.isLogin;

  // platform: 可以看所有页面
  const isPlatform = userType === Role.Platform || userType === Role.SuperAdmin;
  // store: 只能看采购单列表和配件目录相关页面
  const isStore = userType === Role.Store;
  // supplier: 只能看供应商门户相关页面
  const isSupplier = userType === Role.Supplier;
  // 平台审核员
  const isAdminReviewer = roleKey === 'admin_reviewer';

  return {
    isLogin,
    // 采购单相关页面 - platform和store可以访问
    purchaseList: isLogin && (isPlatform || isStore),
    purchaseDetail: isLogin && (isPlatform || isStore),
    purchaseInquiry: isLogin && (isPlatform || isStore),
    purchaseSupplierQuote: isLogin && (isPlatform || isStore),
    // 采购单审核权限 - platform和store可以访问
    purchaseAudit: isLogin && (isPlatform || isStore),
    // 配件目录 - platform和store可以访问
    partCatalog: isLogin && (isPlatform || isStore),
    // 供应商门户 - platform和supplier可以访问
    supplierPortal: isLogin && (isPlatform || isSupplier),
    // 系统管理 - 只有platform可以访问
    systemAdmin: isLogin && isPlatform,
    // 审批列表 - 只有admin_reviewer可以访问
    reviewList: isLogin && isAdminReviewer,
    // 首页 - 所有登录用户都可以访问
    home: isLogin,
  };
};
