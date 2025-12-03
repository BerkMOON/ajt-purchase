import BaseListPage, {
  BaseListPageRef,
} from '@/components/BasicComponents/BaseListPage';
import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import DeleteForm from '@/components/BasicComponents/DeleteForm';
import {
  COMMON_CATEGORY_STATUS,
  COMMON_CATEGORY_STATUS_CODE,
} from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { ProductAPI } from '@/services/system/product/ProductController';
import type {
  GetProductListParams,
  ProductDetailResponse,
  ProductParams,
  UpdateProductStatusParams,
} from '@/services/system/product/typings';
import { CategoryType } from '@/services/system/product/typings.d';
import { AppstoreOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import { Form, message, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { getColumns } from './columns';
import ProductFormFields from './operatorForm';
import { searchForm } from './searchForm';

const ProductManagement: React.FC = () => {
  const { isLogin } = useAccess();
  const baseListRef = useRef<BaseListPageRef>(null);
  const createOrModifyModal = useModalControl();
  const deleteModal = useModalControl();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDetailResponse | null>(null);

  const handleModalOpen = (
    modalControl: ReturnType<typeof useModalControl>,
    product?: ProductDetailResponse,
  ) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
    modalControl.open();
  };

  // 修改产品状态
  const handleChangeStatus = async (record: ProductDetailResponse) => {
    if (!record.product_id) {
      message.warning('产品ID不存在');
      return;
    }

    const currentStatus = record.status?.code;
    const newStatus =
      currentStatus === COMMON_CATEGORY_STATUS_CODE.ACTIVE
        ? COMMON_CATEGORY_STATUS.DISABLED
        : COMMON_CATEGORY_STATUS.ACTIVE;

    try {
      const params: UpdateProductStatusParams = {
        product_id: record.product_id,
        status: newStatus,
      };
      await ProductAPI.updateProductStatus(params);
      message.success(
        newStatus === COMMON_CATEGORY_STATUS.ACTIVE ? '已启用' : '已停用',
      );
      // 刷新列表
      baseListRef.current?.getData();
    } catch (error) {
      console.error('修改产品状态失败:', error);
      message.error('修改产品状态失败');
    }
  };

  const columns = getColumns({
    handleModalOpen,
    handleChangeStatus,
    deleteModal,
  });

  const fetchProductData = async (params: GetProductListParams) => {
    // 处理 category_id：如果是数组，取最后一个值
    const processedParams = {
      ...params,
      category_id: Array.isArray(params.category_id)
        ? params.category_id[params.category_id.length - 1]
        : params.category_id,
    };
    const { data } = await ProductAPI.getProductList(processedParams);
    return {
      list: data.product_list || [],
      total: (data as any).count?.total_count || 0,
    };
  };

  const normalizeCategoryId = (
    categoryValue: number | number[] | undefined,
  ): number => {
    if (Array.isArray(categoryValue)) {
      return categoryValue[categoryValue.length - 1];
    }
    return categoryValue || 0;
  };

  const submitProductForm = async (values: any) => {
    const payload: ProductParams & { product_id?: number } = {
      product_id: selectedProduct?.product_id,
      name: values.name,
      category_id: normalizeCategoryId(values.category_id),
      product_type: CategoryType.PARTS,
      remark: values.remark,
      specification: values.specification,
      photos: values.photos,
    };

    if (selectedProduct?.product_id) {
      return ProductAPI.updateProduct(payload);
    }
    delete payload.product_id;
    return ProductAPI.createProduct(payload);
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  const formInitialValues = selectedProduct
    ? {
        ...selectedProduct,
        category_id: selectedProduct.category_tree
          ?.map((cat) => cat.id)
          .filter(Boolean),
      }
    : undefined;

  return (
    <>
      <BaseListPage
        ref={baseListRef}
        title={
          <Space>
            <AppstoreOutlined />
            <span>产品管理</span>
          </Space>
        }
        columns={columns}
        searchFormItems={searchForm()}
        fetchData={fetchProductData}
        createButton={{
          text: '新建产品',
          onClick: () => handleModalOpen(createOrModifyModal),
        }}
        rowKey="product_id"
      />

      <CreateOrModifyForm
        modalVisible={createOrModifyModal.visible}
        onCancel={createOrModifyModal.close}
        refresh={() => baseListRef.current?.getData()}
        text={{
          title: selectedProduct ? '编辑产品' : '新建产品',
          successMsg: selectedProduct ? '更新成功' : '创建成功',
        }}
        api={submitProductForm}
        record={formInitialValues}
        idMapKey="product_id"
        ownForm={form}
      >
        <ProductFormFields />
      </CreateOrModifyForm>

      <DeleteForm
        modalVisible={deleteModal.visible}
        onCancel={deleteModal.close}
        refresh={() => baseListRef.current?.getData()}
        name="产品"
        params={
          selectedProduct?.product_id
            ? { product_id: selectedProduct.product_id }
            : {}
        }
        api={ProductAPI.deleteProduct}
      />
    </>
  );
};

export default ProductManagement;
