import { BaseListInfo, PageInfoParams } from '@/types/common';
import { NotificationStatus, NotificationType } from './constants';

export interface NotificationInfo {
  id: number;
  notify_type: NotificationType;
  params: string;
  title: string;
  description: string;
}

export interface NotificationListParams extends PageInfoParams {
  status: NotificationStatus;
}

export interface NotificationListResponse extends BaseListInfo {
  notifications: NotificationInfo[];
}
