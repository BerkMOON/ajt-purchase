export interface UserInfo {
  company_name: string;
  create_time: string;
  email: string;
  header_img: string;
  modify_time: string;
  nickname: string;
  phone: string;
  role: string;
  status: {
    code: number;
    name: string;
  };
  store_name: string;
  username: string;
  role_list: RoleList[];
}

export interface RoleList {
  company_id: number;
  company_name: string;
  role: Role;
  store_id: number;
  store_name: string;
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

export interface PageInfo_UserInfo {
  meta: {
    total_count: number;
    total_page: number;
  };
  user_info_list: UserInfo[];
}

export interface ModifyRoleParams {
  user_id: string;
  role_id: string;
}
