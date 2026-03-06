import { Role } from '@/constants';
import { NotificationAPI } from '@/services/notification';
import {
  NotificationStatus,
  NotificationType,
} from '@/services/notification/constants';
import type { NotificationInfo } from '@/services/notification/typings';
import type { UserInfo } from '@/services/system/user/typings';
import { BellOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import {
  Badge,
  Button,
  List,
  message,
  notification,
  Popover,
  Space,
  Spin,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const POLLING_INTERVAL = 30000; // 30秒

/**
 * 根据通知类型和参数获取跳转路由
 * @param notifyType 通知类型
 * @param params 通知参数（JSON字符串）
 * @returns 路由路径，如果无法跳转则返回 null
 */
const getNotificationRoute = (
  notifyType: NotificationType,
  params: string,
): string | null => {
  try {
    const parsedParams = JSON.parse(params || '{}');

    switch (notifyType) {
      case NotificationType.SUPPLIER_QUOTE:
        // 供应商报价通知：跳转到报价页面
        if (parsedParams.inquiry_no) {
          return `/supplier-quote/${parsedParams.inquiry_no}`;
        }
        break;

      case NotificationType.APPROVAL:
        // 审批通知：跳转到审批详情页面
        if (parsedParams.id) {
          return `/review/detail/${parsedParams.quote_no}`;
        }
        // 如果没有 id，可以跳转到审批列表
        return '/review/list';

      default:
        console.warn(`未知的通知类型: ${notifyType}`);
        return null;
    }
  } catch (error) {
    console.error('解析通知参数失败:', error);
    return null;
  }

  return null;
};

const GlobalNotification: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  // 判断是否为供应商角色
  const userInfo = initialState as
    | (UserInfo & { isLogin: boolean })
    | { isLogin: boolean };
  const isSupplier =
    userInfo?.isLogin && (userInfo as UserInfo)?.user_type === Role.Supplier;
  const isAdminReviewer =
    userInfo?.isLogin && (userInfo as UserInfo)?.role_key === 'admin_reviewer';
  const shouldShowNotification = isSupplier || isAdminReviewer;
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [api, contextHolder] = notification.useNotification();
  // 显示 Ant Design notification 提醒
  const showNotificationAlert = useCallback(
    (notification: NotificationInfo) => {
      const btn = (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              api.destroy(notification.id);
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              markAsRead(notification.id, false);
            }}
          >
            处理中
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              handleNotificationClick(notification, true);
            }}
          >
            去处理
          </Button>
        </Space>
      );

      api.info({
        message: notification.title,
        description: notification.description,
        icon: <BellOutlined style={{ color: '#1890ff' }} />,
        duration: null,
        btn,
        placement: 'topRight',
        key: notification.id,
      });
    },
    [],
  );
  // 获取未读通知列表
  const fetchNotifications = useCallback(
    async (isInitial = false) => {
      if (!shouldShowNotification) return;

      try {
        setLoading(true);
        const response = await NotificationAPI.getNotificationList({
          page: 1,
          limit: 20,
          status: NotificationStatus.UNREAD,
        });

        const notificationList = response.data?.notifications || [];

        // 如果不是初始加载，检查是否有新通知
        if (!isInitial && notificationList.length > 0) {
          notificationList.forEach((newNotif) => {
            showNotificationAlert(newNotif);
          });
        }

        setNotifications(notificationList);
        setUnreadCount(notificationList.length);
      } catch (error) {
        console.error('获取通知失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [shouldShowNotification, showNotificationAlert],
  );

  // 标记通知为已读
  const markAsRead = useCallback(
    async (id: number, needRefresh = true) => {
      try {
        await NotificationAPI.readNotification(id);
        if (needRefresh) {
          await fetchNotifications();
        } else {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        message.error('标记已读失败');
        console.error('标记已读失败:', error);
      }
    },
    [fetchNotifications],
  );

  // 处理通知点击
  const handleNotificationClick = useCallback(
    async (notification: NotificationInfo, isDestroy = false) => {
      // 如果有 id，标记为已读
      if (notification.id) {
        await markAsRead(notification.id, !isDestroy);
      }

      // 根据通知类型获取跳转路由
      const route = getNotificationRoute(
        notification.notify_type,
        notification.params,
      );

      if (route) {
        history.push(route);
        if (isDestroy) {
          api.destroy(notification.id);
        } else {
          setVisible(false);
        }
      } else {
        console.warn('无法获取通知跳转路由:', notification);
      }
    },
    [markAsRead, api],
  );

  // 启动轮询
  useEffect(() => {
    if (!shouldShowNotification) return;

    // 立即获取一次（初始加载，不显示通知提醒）
    fetchNotifications(false);

    // 设置定时器，每30秒轮询一次
    pollingTimerRef.current = setInterval(() => {
      fetchNotifications(false);
    }, POLLING_INTERVAL);

    // 清理函数
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [shouldShowNotification, fetchNotifications]);

  // 如果用户不是供应商，不显示通知
  if (!shouldShowNotification) {
    return null;
  }

  const notificationContent = (
    <div style={{ width: 360, maxHeight: 400, overflowY: 'auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
          暂无新通知
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => handleNotificationClick(item)}
            >
              <List.Item.Meta
                title={
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {item.title}
                  </div>
                }
                description={
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {item.description}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <>
      {contextHolder}
      <Popover
        content={notificationContent}
        title="通知"
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        placement="bottomRight"
        overlayStyle={{ paddingTop: 0 }}
      >
        <div
          style={{
            cursor: 'pointer',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Badge count={unreadCount} size="small">
            <BellOutlined style={{ fontSize: 18 }} />
          </Badge>
        </div>
      </Popover>
    </>
  );
};

export default GlobalNotification;
