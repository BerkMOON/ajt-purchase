import { ResponseInfoType } from '@/types/common';
import { request } from '@umijs/max';
import { NotificationListParams, NotificationListResponse } from './typings';

const API_PREFIX = '/api/v1/self/notification';

export const NotificationAPI = {
  /**
   * 通知列表
   * GET /api/v1/self/notification/list
   * 接口ID：399009778
   * 接口地址：https://app.apifox.com/link/project/7357392/apis/api-399009778
   */
  getNotificationList: async (params: NotificationListParams) => {
    return request<ResponseInfoType<NotificationListResponse>>(
      `${API_PREFIX}/list`,
      {
        method: 'GET',
        params,
      },
    );
  },

  readNotification: async (id: number) => {
    return request<ResponseInfoType<null>>(`${API_PREFIX}/read`, {
      method: 'POST',
      data: { id },
    });
  },
};
