import { defineConfig } from '@umijs/max';

export default defineConfig({
  esbuildMinifyIIFE: true,
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '奥吉通集采系统',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
      component: './Home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
      hideInMenu: true,
      access: 'home',
    },
    {
      name: '用户信息',
      path: '/user-info',
      component: './UserInfo',
      access: 'home',
    },
    {
      name: '登录',
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      name: '采购单列表',
      path: '/purchase',
      component: './PurchaseList',
      access: 'purchaseList',
    },
    {
      name: '采购单详情',
      path: '/purchase/:id',
      component: './PurchaseDetail',
      hideInMenu: true,
      access: 'purchaseDetail',
    },
    {
      name: '询价管理',
      path: '/purchase/:id/inquiry',
      component: './InquiryPage',
      hideInMenu: true,
      access: 'purchaseInquiry',
    },
    {
      name: '供应商报价',
      path: '/purchase/:id/supplier-quote',
      component: './SupplierQuote',
      hideInMenu: true,
      access: 'purchaseSupplierQuote',
    },
    {
      name: '供应商门户',
      path: '/supplier-portal',
      component: './SupplierPortal',
      access: 'supplierPortal',
    },
    {
      name: '配件目录',
      path: '/catalog',
      component: './PartCatalog',
      access: 'partCatalog',
    },
    {
      name: '系统管理',
      path: '/admin',
      component: './SystemAdmin',
      access: 'systemAdmin',
    },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      // 标识需要进行转换的请求的url
      // target: 'http://59.110.38.103:8999',
      target: 'http://192.168.8.66:8888',
      // target: 'http://192.168.8.232:8888',
      changeOrigin: true, // 允许域名进行转换
    },
  },
});
