import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import type { CartItem } from '@/services/cart/typings';
import type { CategoryTree } from '@/services/system/product/typings';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, InputNumber, Popconfirm, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

export interface CartColumnsHandlers {
  handleQuantityChange: (skuId: number, newQuantity: number) => void;
  handleIncrease: (item: CartItem) => void;
  handleDecrease: (item: CartItem) => void;
  handleRemove: (skuId: number) => void;
  loading: boolean;
  showDeleteConfirm?: boolean; // 是否显示删除确认弹窗
  actionColumnWidth?: number; // 操作列宽度
  skuIdColumnWidth?: number; // SKU ID 列宽度
  fixedActionColumn?: boolean; // 是否固定操作列
}

export const getCartColumns = ({
  handleQuantityChange,
  handleRemove,
  loading,
  showDeleteConfirm = false,
  actionColumnWidth = 80,
  skuIdColumnWidth = 110,
  fixedActionColumn = false,
}: CartColumnsHandlers): ColumnsType<CartItem> => {
  return [
    {
      title: 'SKU ID',
      dataIndex: 'sku_id',
      key: 'sku_id',
      width: skuIdColumnWidth,
    },
    {
      title: 'SKU 名称',
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '销售属性',
      key: 'attr_pairs',
      width: 250,
      render: (_, record) => {
        if (!record.attr_pairs || record.attr_pairs.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <Space wrap>
            {record.attr_pairs.map((pair, index) => (
              <Tag key={index} color="blue">
                {pair.attr_name || pair.attr_code || ''}:{' '}
                {pair.value_name || pair.value_code || ''}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '商品品类',
      key: 'category_tree',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        if (record.category_tree && record.category_tree.length > 0) {
          return record.category_tree
            .map((cat: CategoryTree) => cat.name)
            .join(' > ');
        }
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
    {
      title: '商品状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        if (!record.status) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const isActive =
          record.status.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;
        return (
          <Tag color={isActive ? 'success' : 'default'}>
            {record.status.name || (isActive ? '启用' : '停用')}
          </Tag>
        );
      },
    },
    {
      title: '数量',
      key: 'quantity',
      width: 200,
      render: (_: any, record: CartItem) => {
        // 数量控制组件：乐观更新UI，防抖发送请求
        const QuantityControl: React.FC<{ record: CartItem }> = ({
          record,
        }) => {
          const [localQuantity, setLocalQuantity] = useState<number>(
            record.quantity || 1,
          );
          const [inputValue, setInputValue] = useState<number | null>(
            record.quantity || 1,
          );
          const debounceTimerRef = React.useRef<ReturnType<
            typeof setTimeout
          > | null>(null);

          // 当服务器数据更新时，同步本地状态
          React.useEffect(() => {
            setLocalQuantity(record.quantity || 1);
            setInputValue(record.quantity || 1);
          }, [record.quantity]);

          // 防抖发送请求
          const debouncedQuantityChange = (newQuantity: number) => {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
              if (newQuantity > 0 && newQuantity !== record.quantity) {
                handleQuantityChange(record.sku_id, newQuantity);
              }
            }, 300); // 停止操作后300ms发送请求
          };

          // 处理增减按钮点击
          const handleButtonClick = (delta: number) => {
            if (loading) return;

            const newQuantity = Math.max(1, localQuantity + delta);
            // 立即更新UI（乐观更新）
            setLocalQuantity(newQuantity);
            setInputValue(newQuantity);
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
                handleQuantityChange(record.sku_id, finalValue);
              }
            } else {
              // 如果输入无效，恢复原值
              setInputValue(localQuantity);
            }
          };

          // 清理定时器
          React.useEffect(() => {
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
        };

        return <QuantityControl record={record} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: actionColumnWidth,
      ...(fixedActionColumn && { fixed: 'right' as const }),
      render: (_: any, record: CartItem) => {
        const removeButton = (
          <Button
            type="link"
            danger
            size="small"
            icon={showDeleteConfirm ? <DeleteOutlined /> : undefined}
            onClick={() => handleRemove(record.sku_id)}
            disabled={loading}
          >
            {showDeleteConfirm ? '删除' : '移除'}
          </Button>
        );

        if (showDeleteConfirm) {
          return (
            <Popconfirm
              title="确定要删除这个商品吗？"
              onConfirm={() => handleRemove(record.sku_id)}
              okText="确定"
              cancelText="取消"
            >
              {removeButton}
            </Popconfirm>
          );
        }

        return removeButton;
      },
    },
  ];
};
