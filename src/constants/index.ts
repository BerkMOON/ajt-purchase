export const DEFAULT_NAME = 'Umi Max';
export const GdMapApiKey = '95883d933e2f60323c0fa399ad4f6202';
export enum COMMON_STATUS {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export enum COMMON_STATUS_CODE {
  DELETED,
  ACTIVE,
}

export enum SuccessCode {
  SUCCESS = 200,
}

export enum AUDIT_LEVEL {
  A = 'AAAA',
  B = 'AAA',
  C = 'AA',
  D = 'A',
}

export enum AUDIT_RESULT {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const DEVICE_STATUS = {
  NOT_UPGRADED: 0,
  UPGRADING: 1,
  SUCCESS: 2,
  FAILED: 3,
} as const;

export enum STATUS_LABEL {
  ACTIVE = '生效中',
  DELETED = '已删除',
}

export const STATUS_OPTIONS = [
  { label: STATUS_LABEL.ACTIVE, value: COMMON_STATUS.ACTIVE },
  { label: STATUS_LABEL.DELETED, value: COMMON_STATUS.DELETED },
];

export enum Role {
  Support = 'support',
  SupportDirector = 'supportDirector',
  Admin = 'admin',
  Finance = 'finance',
  SupportManager = 'customer_service_manager',
}

export const ROLES_INFO = {
  [Role.Support]: '外拓专员',
  [Role.SupportDirector]: '售后总监',
  [Role.SupportManager]: '客服经理',
  [Role.Admin]: '店长',
};

export const ACCESS_ROLE = [
  Role.SupportDirector,
  Role.Admin,
  Role.SupportManager,
];

export enum TaskStatus {
  All = 'all',
  /** 待处理 */
  Pending = 'pending',
  /** 已处理 */
  Processing = 'processing',
  /** 待返厂 */
  WaitingForReturn = 'waitingForReturn',
  /** 已完成 */
  Returned = 'returned',
  /** 已拒绝 */
  Rejected = 'rejected',
}

export enum TaskStatusLabel {
  All = '全部',
  /** 待处理 */
  Pending = '待认领',
  /** 已处理 */
  Processing = '已认领',
  /** 待返厂 */
  WaitingForReturn = '待返厂',
  /** 已完成 */
  Returned = '已完成',
  /** 已拒绝 */
  Rejected = '已拒绝',
}

export enum TaskType {
  Pending = 1,
  Processing = 2,
  Returned = 3,
  Rejected = 4,
  WaitingForReturn = 5,
}

export const TASK_STATUS_OPTIONS = [
  { label: TaskStatusLabel.All, value: TaskStatus.All },
  { label: TaskStatusLabel.Pending, value: TaskStatus.Pending },
  { label: TaskStatusLabel.Processing, value: TaskStatus.Processing },
  {
    label: TaskStatusLabel.WaitingForReturn,
    value: TaskStatus.WaitingForReturn,
  },
  { label: TaskStatusLabel.Returned, value: TaskStatus.Returned },
  { label: TaskStatusLabel.Rejected, value: TaskStatus.Rejected },
];

export const TaskStatusOptions = [
  { label: '待返厂', value: TaskStatus.WaitingForReturn },
  { label: '已返厂', value: TaskStatus.Returned },
  { label: '战败', value: TaskStatus.Rejected },
];
