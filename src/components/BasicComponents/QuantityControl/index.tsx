import type { CartItem } from '@/services/cart/typings';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, InputNumber, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

export interface QuantityControlProps {
  record: CartItem;
  loading: boolean;
  onQuantityChange: (skuId: number, newQuantity: number) => void;
}

/**
 * 数量控制组件：乐观更新 + 防抖请求
 */
const QuantityControl: React.FC<QuantityControlProps> = React.memo(
  ({ record, loading, onQuantityChange }) => {
    const [localQuantity, setLocalQuantity] = useState<number>(
      record.quantity || 1,
    );
    const [inputValue, setInputValue] = useState<number | null>(
      record.quantity || 1,
    );
    const pendingQuantityRef = useRef<number | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 当服务器数据更新时，同步本地状态
    useEffect(() => {
      const serverQuantity = record.quantity || 1;
      // 若存在乐观更新且与后端返回不一致，则暂不覆盖本地
      if (
        pendingQuantityRef.current !== null &&
        serverQuantity !== pendingQuantityRef.current
      ) {
        return;
      }

      setLocalQuantity(serverQuantity);
      setInputValue(serverQuantity);
      if (
        pendingQuantityRef.current !== null &&
        serverQuantity === pendingQuantityRef.current
      ) {
        pendingQuantityRef.current = null;
      }
    }, [record.quantity]);

    // 防抖发送请求
    const debouncedQuantityChange = (newQuantity: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (newQuantity > 0 && newQuantity !== record.quantity) {
          onQuantityChange(record.sku_id, newQuantity);
        }
      }, 300);
    };

    // 处理增减按钮点击
    const handleButtonClick = (delta: number) => {
      if (loading) return;

      const newQuantity = Math.max(1, localQuantity + delta);
      // 立即更新UI（乐观更新）
      setLocalQuantity(newQuantity);
      setInputValue(newQuantity);
      pendingQuantityRef.current = newQuantity;
      // 防抖发送请求
      debouncedQuantityChange(newQuantity);
    };

    // 处理输入框变化
    const handleInputChange = (value: number | null) => {
      setInputValue(value);
    };

    // 处理输入框失焦或回车
    const handleInputBlur = () => {
      const finalValue = inputValue;
      if (finalValue && finalValue > 0) {
        setLocalQuantity(finalValue);
        // 立即发送请求（用户主动输入）
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        if (finalValue !== record.quantity) {
          pendingQuantityRef.current = finalValue;
          onQuantityChange(record.sku_id, finalValue);
        }
      } else {
        // 如果输入无效，恢复原值
        setInputValue(localQuantity);
      }
    };

    // 清理定时器
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    return (
      <Space>
        <Button
          icon={<MinusOutlined />}
          size="small"
          onClick={() => handleButtonClick(-1)}
          disabled={loading || localQuantity <= 1}
        />
        <InputNumber
          value={inputValue}
          min={1}
          precision={0}
          style={{ width: 80 }}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onPressEnter={handleInputBlur}
          disabled={loading}
        />
        <Button
          icon={<PlusOutlined />}
          size="small"
          onClick={() => handleButtonClick(1)}
          disabled={loading}
        />
      </Space>
    );
  },
);

export default QuantityControl;
