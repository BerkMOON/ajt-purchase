import CategoryCascader from '@/components/BasicComponents/CategoryCascader';
import { ProductAPI } from '@/services/system/product/ProductController';
import type { ProductInfo } from '@/services/system/product/typings';
import { SkuAPI } from '@/services/system/sku/SkuController';
import type { SkuListInfo } from '@/services/system/sku/typings';
import { Col, Row, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';

interface SkuSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  allowClear?: boolean;
  /** 初始品类路径数组（用于回填） */
  initialCategoryPath?: number[];
  /** 初始产品ID（用于回填） */
  initialProductId?: number;
  /** 品类路径变化回调 */
  onCategoryPathChange?: (path: number[] | undefined) => void;
  /** 产品ID变化回调 */
  onProductIdChange?: (productId: number | undefined) => void;
}

const SkuSelect: React.FC<SkuSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择SKU',
  disabled = false,
  style,
  allowClear = true,
  initialCategoryPath,
  initialProductId,
  onCategoryPathChange,
  onProductIdChange,
}) => {
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialCategoryPath && initialCategoryPath.length > 0
      ? initialCategoryPath[initialCategoryPath.length - 1]
      : undefined,
  );
  const [categoryPath, setCategoryPath] = useState<number[] | undefined>(
    initialCategoryPath,
  );
  const [productId, setProductId] = useState<number | undefined>(
    initialProductId,
  );
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [skus, setSkus] = useState<SkuListInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSkus, setLoadingSkus] = useState(false);

  // 当初始值变化时，更新状态（用于回填，仅设置一次）
  useEffect(() => {
    if (
      initialCategoryPath &&
      initialCategoryPath.length > 0 &&
      !categoryPath
    ) {
      const finalCategoryId =
        initialCategoryPath[initialCategoryPath.length - 1];
      setCategoryPath(initialCategoryPath);
      setCategoryId(finalCategoryId);
    }
    if (initialProductId !== undefined && !productId) {
      setProductId(initialProductId);
    }
  }, [initialCategoryPath, initialProductId]);

  // 当品类变化时，加载产品列表（只在用户主动选择品类时加载）
  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) {
        setProducts([]);
        // 只有在不是通过初始值设置的情况下才清空产品ID
        if (!initialProductId) {
          setProductId(undefined);
        }
        setSkus([]);
        // 只有在用户主动清空品类时才清空SKU选择
        if (onChange && !value && !initialProductId) {
          onChange(undefined as any);
        }
        return;
      }

      setLoadingProducts(true);
      try {
        const response = await ProductAPI.getProductList({
          page: 1,
          limit: 1000,
          category_id: categoryId,
        });
        setProducts(response.data.product_list || []);
      } catch (error) {
        console.error('获取产品列表失败:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // 当产品变化时，加载SKU列表（只在用户主动选择产品时加载）
  useEffect(() => {
    const fetchSkus = async () => {
      if (!productId) {
        setSkus([]);
        // 只有在用户主动清空产品时才清空SKU选择
        if (onChange && !value && !initialProductId) {
          onChange(undefined as any);
        }
        return;
      }

      setLoadingSkus(true);
      try {
        const response = await SkuAPI.getSkuListByProduct({
          product_id: productId,
        });
        const skuList = response.data.sku_list || [];
        setSkus(skuList);
      } catch (error) {
        console.error('获取SKU列表失败:', error);
        setSkus([]);
      } finally {
        setLoadingSkus(false);
      }
    };

    fetchSkus();
  }, [productId]);

  // 处理品类选择变化
  const handleCategoryChange = (val: number | number[] | undefined) => {
    const path = Array.isArray(val) ? val : val ? [val] : undefined;
    const finalCategoryId =
      path && path.length > 0 ? path[path.length - 1] : undefined;
    setCategoryPath(path);
    setCategoryId(finalCategoryId);
    // 通知父组件品类路径变化
    if (onCategoryPathChange) {
      onCategoryPathChange(path);
    }
    // 清空产品和SKU选择
    setProductId(undefined);
    setSkus([]);
    if (onProductIdChange) {
      onProductIdChange(undefined);
    }
    if (onChange) {
      onChange(undefined as any);
    }
  };

  // 处理产品选择变化
  const handleProductChange = (val: number) => {
    setProductId(val);
    // 通知父组件产品ID变化
    if (onProductIdChange) {
      onProductIdChange(val);
    }
    setSkus([]);
    // 清空SKU选择
    if (onChange) {
      onChange(undefined as any);
    }
  };

  // 处理SKU选择变化
  const handleSkuChange = (val: number) => {
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <Row gutter={8} style={{ width: '100%', ...style }}>
      <Col span={8}>
        <CategoryCascader
          placeholder="请选择品类"
          value={categoryPath}
          onChange={handleCategoryChange}
          disabled={disabled}
          allowClear={allowClear}
          style={{ width: '100%' }}
        />
      </Col>
      <Col span={8}>
        <Select
          placeholder="请选择产品"
          value={productId}
          onChange={handleProductChange}
          disabled={disabled || !categoryId}
          allowClear={allowClear}
          loading={loadingProducts}
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {products.map((product) => (
            <Select.Option
              key={product.product_id}
              value={product.product_id}
              label={product.name}
            >
              {product.name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col span={8}>
        <Select
          placeholder={placeholder}
          value={value}
          onChange={handleSkuChange}
          disabled={disabled || !productId}
          allowClear={allowClear}
          loading={loadingSkus}
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          notFoundContent={loadingSkus ? <Spin size="small" /> : '暂无数据'}
        >
          {skus.map((sku) => (
            <Select.Option
              key={sku.sku_id}
              value={sku.sku_id}
              label={sku.sku_name}
            >
              {sku.sku_name}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default SkuSelect;
