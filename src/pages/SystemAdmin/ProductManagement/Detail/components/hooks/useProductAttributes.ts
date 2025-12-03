import {
  COMMON_CATEGORY_STATUS,
  COMMON_CATEGORY_STATUS_CODE,
} from '@/constants';
import { AttrAPI } from '@/services/system/attr/AttrController';
import type { Attr, AttrValueInfo } from '@/services/system/attr/typings';
import { StatusInfo } from '@/types/common';
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

export const useProductAttributes = (productId: number) => {
  const [attrs, setAttrs] = useState<(Attr & { status?: StatusInfo })[]>([]);
  const [loading, setLoading] = useState(false);
  const [attrValueMap, setAttrValueMap] = useState<
    Record<string, AttrValueInfo[]>
  >({});

  // 获取销售属性列表
  const fetchAttrs = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await AttrAPI.getAttrList({
        product_id: productId,
      });
      const attrsList = response.data.attrs;
      setAttrs(attrsList);

      // 获取每个属性的值列表
      const valueMap: Record<string, AttrValueInfo[]> = {};
      if (attrsList.length > 0) {
        await Promise.all(
          attrsList.map(async (attr) => {
            try {
              const valueResponse = await AttrAPI.getAttrValueList({
                attr_code: attr.attr_code,
                product_id: productId,
              });
              valueMap[attr.attr_code] = valueResponse.data.values || [];
            } catch (error) {
              console.error(`获取属性值失败: ${attr.attr_code}`, error);
              valueMap[attr.attr_code] = [];
            }
          }),
        );
      }
      setAttrValueMap(valueMap);
    } catch (error) {
      console.error('获取销售属性失败:', error);
      message.error('获取销售属性失败');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchAttrs();
  }, [fetchAttrs]);

  // 删除属性
  const handleDeleteAttr = async (attr: Attr & { status?: StatusInfo }) => {
    try {
      await AttrAPI.deleteAttr({
        attr_code: attr.attr_code,
        product_id: productId,
      });
      message.success('删除成功');
      fetchAttrs();
    } catch (error) {
      console.error('删除属性失败:', error);
      message.error('删除失败');
    }
  };

  // 修改属性状态
  const handleChangeAttrStatus = async (
    attr: Attr & { status?: StatusInfo },
  ) => {
    try {
      const currentStatus =
        attr.status?.code ?? COMMON_CATEGORY_STATUS_CODE.ACTIVE;
      const newStatus =
        currentStatus === COMMON_CATEGORY_STATUS_CODE.ACTIVE
          ? COMMON_CATEGORY_STATUS.DISABLED
          : COMMON_CATEGORY_STATUS.ACTIVE;

      await AttrAPI.updateAttrStatus({
        attr_code: attr.attr_code,
        product_id: productId,
        status: newStatus,
      });
      message.success(
        newStatus === COMMON_CATEGORY_STATUS.ACTIVE ? '已启用' : '已停用',
      );
      fetchAttrs();
    } catch (error) {
      console.error('修改属性状态失败:', error);
      message.error('修改状态失败');
    }
  };

  // 删除属性值
  const handleDeleteValue = async (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => {
    try {
      await AttrAPI.deleteAttrValue({
        attr_code: attr.attr_code,
        product_id: productId,
        value_code: value.value_code,
      });
      message.success('删除成功');
      fetchAttrs();
    } catch (error) {
      console.error('删除属性值失败:', error);
      message.error('删除失败');
    }
  };

  // 修改属性值状态
  const handleChangeValueStatus = async (
    attr: Attr & { status?: StatusInfo },
    value: AttrValueInfo,
  ) => {
    try {
      const currentStatus = value.status?.code;
      const newStatus =
        currentStatus === COMMON_CATEGORY_STATUS_CODE.ACTIVE
          ? COMMON_CATEGORY_STATUS.DISABLED
          : COMMON_CATEGORY_STATUS.ACTIVE;

      await AttrAPI.updateAttrValueStatus({
        attr_code: attr.attr_code,
        product_id: productId,
        value_code: value.value_code,
        status: newStatus,
      });
      message.success(
        newStatus === COMMON_CATEGORY_STATUS.ACTIVE ? '已启用' : '已停用',
      );
      fetchAttrs();
    } catch (error) {
      console.error('修改属性值状态失败:', error);
      message.error('修改状态失败');
    }
  };

  return {
    attrs,
    loading,
    attrValueMap,
    fetchAttrs,
    handleDeleteAttr,
    handleChangeAttrStatus,
    handleDeleteValue,
    handleChangeValueStatus,
  };
};
