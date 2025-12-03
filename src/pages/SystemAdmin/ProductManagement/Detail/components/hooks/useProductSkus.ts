import {
  COMMON_CATEGORY_STATUS,
  COMMON_CATEGORY_STATUS_CODE,
} from '@/constants';
import { SkuAPI } from '@/services/system/sku/SkuController';
import type { SkuListInfo } from '@/services/system/sku/typings';
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

export const useProductSkus = (productId: number) => {
  const [skus, setSkus] = useState<SkuListInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取 SKU 列表
  const fetchSkus = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await SkuAPI.getSkuListByProduct({
        product_id: productId,
      });
      setSkus(response.data.sku_list || []);
    } catch (error) {
      console.error('获取 SKU 列表失败:', error);
      message.error('获取 SKU 列表失败');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchSkus();
  }, [fetchSkus]);

  // 删除 SKU
  const handleDeleteSku = async (skuId: number) => {
    try {
      await SkuAPI.deleteSku(skuId);
      message.success('删除成功');
      fetchSkus();
    } catch (error) {
      console.error('删除 SKU 失败:', error);
      message.error('删除失败');
    }
  };

  // 修改 SKU 状态
  const handleChangeSkuStatus = async (sku: SkuListInfo) => {
    if (!sku.sku_id) return;
    try {
      const currentStatus = sku.status?.code;
      const newStatus =
        currentStatus === COMMON_CATEGORY_STATUS_CODE.ACTIVE
          ? COMMON_CATEGORY_STATUS.DISABLED
          : COMMON_CATEGORY_STATUS.ACTIVE;

      await SkuAPI.updateSkuStatus({
        sku_id: sku.sku_id,
        status: newStatus,
      });
      message.success(
        newStatus === COMMON_CATEGORY_STATUS.ACTIVE ? '已启用' : '已停用',
      );
      fetchSkus();
    } catch (error) {
      console.error('修改 SKU 状态失败:', error);
      message.error('修改状态失败');
    }
  };

  return {
    skus,
    loading,
    fetchSkus,
    handleDeleteSku,
    handleChangeSkuStatus,
  };
};
