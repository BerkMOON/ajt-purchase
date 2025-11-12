import { COMMON_STATUS, Role } from '@/constants';
import { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';

export interface RoleListRequest extends PageInfoParams {
  role_key?: string;
  role_name?: string;
  /**
   * platform平台，store门店，supplier供应商
   */
  role_type?: Role;
  /**
   * active生效，deleted删除
   */
  status?: COMMON_STATUS;
}

export interface RoleInfo {
  create_time: string;
  id: number;
  modify_time: string;
  remark: string;
  role_key: string;
  role_name: string;
  role_type: Role;
  status: StatusInfo;
}

export interface RoleListResponse extends BaseListInfo {
  roles: RoleInfo[];
}

export interface CreateRoleRequest {
  role_key: string;
  role_name: string;
  role_type: Role;
  remark?: string;
}
