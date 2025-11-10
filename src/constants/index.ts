export const DEFAULT_NAME = 'Umi Max';
export const SecretKey = '6794xzUkZDgRh4DUCuq54pJs';

export enum SuccessCode {
  SUCCESS = 200,
}

export enum Role {
  Platform = 'platform',
  Store = 'store',
  Supplier = 'supplier',
  SuperAdmin = 'superAdmin',
}

export const ROLES_INFO = {
  [Role.Platform]: '平台管理员',
  [Role.Store]: '集采人员',
  [Role.Supplier]: '供应商',
  [Role.SuperAdmin]: '超级管理员',
};

export const USER_TYPE_OPTIONS = [
  { label: '平台', value: Role.Platform },
  { label: '门店', value: Role.Store },
  { label: '供应商', value: Role.Supplier },
];

export enum COMMON_STATUS_CODE {
  ACTIVE = 1,
  DELETED = 0,
}

export enum COMMON_STATUS {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export const USER_STATUS = {
  [COMMON_STATUS.ACTIVE]: '生效',
  [COMMON_STATUS.DELETED]: '已删除',
};
