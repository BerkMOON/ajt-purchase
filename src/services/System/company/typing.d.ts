import {
  BaseListInfo,
  PageInfoParams,
  StatusInfo,
} from '../../../types/common';

export interface CompanyItem {
  id: string;
  company_name: string;
  remark: string;
  create_time: string;
  modify_time: string;
  status: StatusInfo;
}

export interface CompanyList extends BaseListInfo {
  companies: CompanyItem[];
}

export interface CompanyParams extends PageInfoParams {
  name?: string;
}

export interface CompanyCreateParams {
  name: string;
  extra?: string;
}

export interface CompanyDeleteParams {
  id: string;
}

export interface CompanyUpdateParams extends CompanyCreateParams {
  id: string;
}
