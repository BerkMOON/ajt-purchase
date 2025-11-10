import { COMMON_STATUS, COMMON_STATUS_CODE } from '@/constants';

type CommonStatusValue =
  | typeof COMMON_STATUS.ACTIVE
  | typeof COMMON_STATUS.DELETED;

interface StatusLike {
  code?: number;
  name?: string;
}

export const DEFAULT_STATUS_META: Record<
  CommonStatusValue,
  { text: string; color: string }
> = {
  [COMMON_STATUS.ACTIVE]: { text: '生效', color: 'green' },
  [COMMON_STATUS.DELETED]: { text: '停用', color: 'orange' },
};

export const resolveCommonStatus = (
  status?: StatusLike | null,
): CommonStatusValue => {
  if (!status) {
    return COMMON_STATUS.ACTIVE;
  }

  const statusCode = status.code;
  const statusName = status.name?.toLowerCase() || '';

  if (statusCode === COMMON_STATUS_CODE.ACTIVE) return COMMON_STATUS.ACTIVE;
  if (statusCode === COMMON_STATUS_CODE.DELETED) return COMMON_STATUS.DELETED;

  if (statusName.includes('active') || statusName.includes('生效')) {
    return COMMON_STATUS.ACTIVE;
  }
  if (
    statusName.includes('deleted') ||
    statusName.includes('删除') ||
    statusName.includes('停用') ||
    statusName.includes('失效')
  ) {
    return COMMON_STATUS.DELETED;
  }

  return COMMON_STATUS.ACTIVE;
};

export const getStatusMeta = (
  status: CommonStatusValue,
  overrides?: Partial<
    Record<CommonStatusValue, Partial<{ text: string; color: string }>>
  >,
) => {
  const baseMeta = DEFAULT_STATUS_META[status];
  const overrideMeta = overrides?.[status];

  return overrideMeta ? { ...baseMeta, ...overrideMeta } : baseMeta;
};
