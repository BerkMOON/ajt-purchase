import { formatDate } from '@/pages/PurchaseDetail/utils';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

interface CountdownTextProps {
  isInquiring?: boolean;
  deadline: string;
  /** 是否显示日期时间，默认为 true */
  showDateTime?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const CountdownText: React.FC<CountdownTextProps> = ({
  deadline,
  isInquiring = true, // 是否在询价中，默认在询价中，如果不在询价中，则不显示倒计时
  showDateTime = true,
  style,
}) => {
  const [countdown, setCountdown] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!isInquiring) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = dayjs();
      const deadlineTime = dayjs(deadline);
      // dayjs diff 返回毫秒数
      const diffMs = deadlineTime.diff(now);

      if (diffMs <= 0) {
        setExpired(true);
        setCountdown('');
        return;
      }

      setExpired(false);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      let countdownStr = '';
      if (days > 0) {
        countdownStr = `${days}天 ${hours}小时 ${minutes}分钟`;
      } else if (hours > 0) {
        countdownStr = `${hours}小时 ${minutes}分钟 ${seconds}秒`;
      } else if (minutes > 0) {
        countdownStr = `${minutes}分钟 ${seconds}秒`;
      } else {
        countdownStr = `${seconds}秒`;
      }

      setCountdown(countdownStr);
    };

    // 立即更新一次
    updateCountdown();

    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span style={style}>
      {showDateTime && formatDate(deadline)}
      {!expired && countdown && (
        <Tag color="orange" style={{ marginLeft: 8 }}>
          剩余 {countdown}
        </Tag>
      )}
      {expired && (
        <Tag color="red" style={{ marginLeft: 8 }}>
          已过期
        </Tag>
      )}
    </span>
  );
};

export default CountdownText;
