import { COMMON_STATUS, Role } from '@/constants';
import { BaseListInfo, PageInfoParams, StatusInfo } from '@/types/common';
export interface UserInfo {
  create_time: string;
  email: string;
  header_img: string;
  id: number;
  login_date: string;
  login_ip: string;
  modify_time: string;
  nickname: string;
  phone: string;
  pwd_update_date: string;
  remark: string;
  status: StatusInfo;
  user_type: string;
  username: string;
}

export interface RoleList {
  company_id: number;
  company_name: string;
  role: Role;
  store_id: number;
  store_name: string;
}

export interface CreateUserParams {
  email?: string;
  header_img?: string;
  nickname?: string;
  password: string;
  phone?: string;
  remark?: string;
  user_type: Role;
  username: string;
}

export interface AuthorityInfo {
  name: string;
  code: string;
  endpoints: {
    name: string;
    code: string;
  }[];
}
export interface UserSelfInfo {
  authority: (AuthorityInfo & {
    children: AuthorityInfo[];
  })[];
  user_info: UserInfo;
}

export interface QueryUserListParams extends PageInfoParams {
  username?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  status?: COMMON_STATUS;
  user_type: Role;
}
export interface QueryUserListResponse extends BaseListInfo {
  users: UserInfo[];
}

export interface ModifyRoleParams {
  user_id: string;
  role_id: string;
}

export interface CaptchaRequest {
  nonce: string;
  signature: string;
  timestamp: number;
}

export interface CaptchaResponse {
  captcha_id: string;
  img: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserRoleResponse {
  role_ids: number[];
}
