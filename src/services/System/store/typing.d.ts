import { COMMON_STATUS } from '@/constants';
import {
  BaseListInfo,
  PageInfoParams,
  StatusInfo,
} from '../../../types/common';

export interface StoreItem {
  id: number;
  company_id: number;
  store_name: string;
  contacts: string;
  phone: string;
  email: string;
  address: string;
  remark: string;
  status: StatusInfo;
}

export interface StoreList extends BaseListInfo {
  stores: StoreItem[];
}

export interface StoreParams extends PageInfoParams {
  store_name?: string;
  company_id: string;
  status: COMMON_STATUS;
}

export interface StoreCreateParams {
  store_name: string;
  extra?: string;
  company_id?: string;
  notify: string;
}

export interface StoreDeleteParams {
  id: string;
}

export interface StoreUpdateParams extends StoreCreateParams {
  id: string;
}

export interface StoreCodeParams {
  company_id: string;
  store_id: string;
}
