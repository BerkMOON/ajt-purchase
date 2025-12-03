import { CategoryAPI } from '@/services/system/category/CategoryController';
import type { CategoryInfo } from '@/services/system/category/typing';
import { Cascader, message } from 'antd';
import type { CascaderProps } from 'antd/es/cascader';
import React, { useEffect, useState } from 'react';

interface CategoryCascaderProps extends Omit<CascaderProps<any>, 'options'> {
  /** 是否自动加载品类树数据，默认为 true */
  autoLoad?: boolean;
  /** 外部传入的品类选项，如果提供则不会自动加载 */
  options?: any[];
  /** 加载状态，如果提供则使用外部状态 */
  loading?: boolean;
}

const CategoryCascader: React.FC<CategoryCascaderProps> = ({
  autoLoad = true,
  options: externalOptions,
  loading: externalLoading,
  ...restProps
}) => {
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载品类树数据并转换为 Cascader 格式
  const loadCategoryTree = async () => {
    setLoading(true);
    try {
      const response = await CategoryAPI.getChildren({ parent_id: 0 });
      const categories = response.data.categories || [];

      // 递归加载所有层级的品类
      const loadCategoryRecursively = async (
        parentId: number,
      ): Promise<any[]> => {
        const children = await CategoryAPI.getChildren({ parent_id: parentId });
        const childCategories = children.data.categories || [];

        const result = await Promise.all(
          childCategories.map(async (cat: CategoryInfo) => {
            const node: any = {
              value: cat.id,
              label: cat.name,
            };

            // 如果该节点有子节点，递归加载
            if (cat.has_children && cat.id) {
              node.children = await loadCategoryRecursively(cat.id);
            }

            return node;
          }),
        );

        return result;
      };

      const options = await Promise.all(
        categories.map(async (cat: CategoryInfo) => {
          const node: any = {
            value: cat.id,
            label: cat.name,
          };

          if (cat.has_children && cat.id) {
            node.children = await loadCategoryRecursively(cat.id);
          }

          return node;
        }),
      );

      setCategoryOptions(options);
    } catch (error) {
      console.error('加载品类树失败:', error);
      message.error('加载品类树失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad && !externalOptions) {
      loadCategoryTree();
    }
  }, [autoLoad, externalOptions]);

  // 使用外部传入的选项或内部加载的选项
  const options = externalOptions || categoryOptions;
  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  return (
    <Cascader
      options={options}
      placeholder="请选择品类"
      changeOnSelect
      displayRender={(labels) => labels.join(' > ')}
      loading={isLoading}
      allowClear
      {...restProps}
    />
  );
};

export default CategoryCascader;
