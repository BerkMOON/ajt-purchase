import CreateOrModifyForm from '@/components/BasicComponents/CreateOrModifyForm';
import RichTextViewer from '@/components/BasicComponents/RichTextViewer';
import {
  COMMON_CATEGORY_STATUS,
  COMMON_CATEGORY_STATUS_CODE,
} from '@/constants';
import { useModalControl } from '@/hooks/useModalControl';
import { ProductAPI } from '@/services/system/product/ProductController';
import type {
  ProductDetailResponse,
  ProductParams,
  UpdateProductStatusParams,
} from '@/services/system/product/typings';
import { CategoryType } from '@/services/system/product/typings.d';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { history, Navigate, useAccess, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  message,
  Row,
  Space,
  Spin,
  Tag,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ProductFormFields from '../operatorForm';
import ProductAttributes from './components/ProductAttributes';
import ProductSkus from './components/ProductSkus';

const ProductDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const editModal = useModalControl();

  const fetchProductDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await ProductAPI.getProductDetail(Number(id));
      setProduct(response.data);
    } catch (error) {
      message.error('获取产品详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const handleChangeStatus = async () => {
    if (!product?.product_id) {
      message.warning('产品ID不存在');
      return;
    }

    const currentStatus = product.status?.code;
    const newStatus =
      currentStatus === COMMON_CATEGORY_STATUS_CODE.ACTIVE
        ? COMMON_CATEGORY_STATUS.DISABLED
        : COMMON_CATEGORY_STATUS.ACTIVE;

    try {
      const params: UpdateProductStatusParams = {
        product_id: product.product_id,
        status: newStatus,
      };
      await ProductAPI.updateProductStatus(params);
      message.success(
        newStatus === COMMON_CATEGORY_STATUS.ACTIVE ? '已启用' : '已停用',
      );
      fetchProductDetail();
    } catch (error) {
      console.error('修改产品状态失败:', error);
      message.error('修改产品状态失败');
    }
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
    if (!product?.product_id) {
      message.error('产品ID不存在');
      return;
    }

    const payload: ProductParams & { product_id: number } = {
      product_id: product.product_id,
      name: values.name,
      category_id: normalizeCategoryId(values.category_id),
      product_type: CategoryType.PARTS,
      remark: values.remark,
      specification: values.specification,
      photos: values.photos,
    };

    return ProductAPI.updateProduct(payload);
  };

  const formInitialValues = product
    ? {
        ...product,
        category_id: product.category_tree
          ?.map((cat) => cat.id)
          .filter(Boolean),
      }
    : undefined;

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>产品不存在或已被删除</p>
            <Button onClick={() => history.push('/admin')}>返回系统管理</Button>
          </div>
        </Card>
      </div>
    );
  }

  const isActive = product.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            返回
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => editModal.open()}
          >
            编辑
          </Button>
          <Button
            type={isActive ? 'default' : 'primary'}
            onClick={handleChangeStatus}
          >
            {isActive ? '停用' : '启用'}
          </Button>
        </Space>

        <Descriptions title="产品信息">
          <Descriptions.Item label="产品ID">
            {product.product_id}
          </Descriptions.Item>
          <Descriptions.Item label="产品名称">{product.name}</Descriptions.Item>
          <Descriptions.Item label="所属品类">
            {product.category_tree && product.category_tree.length > 0
              ? product.category_tree.map((cat) => cat.name).join(' > ')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag color="blue">
              {product.product_type === 'parts'
                ? '备件'
                : product.product_type || '备件'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {isActive ? (
              <Tag color="success">启用</Tag>
            ) : (
              <Tag color="default">停用</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {product.create_time || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {product.modify_time || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {product.remark || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="规格说明" span={2}>
            <RichTextViewer content={product.specification} />
          </Descriptions.Item>
          {product.photos && product.photos.length > 0 && (
            <Descriptions.Item label="产品图片" span={2}>
              <Row gutter={[16, 16]}>
                {product.photos.map((photo, index) => (
                  <Col key={index}>
                    <img
                      src={photo.url || photo.path}
                      alt={`产品图片 ${index + 1}`}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {product.product_id && (
        <>
          <Card style={{ marginTop: 24 }}>
            <ProductAttributes productId={product.product_id} />
          </Card>
          <Card style={{ marginTop: 24 }}>
            <ProductSkus productId={product.product_id} />
          </Card>
        </>
      )}

      <CreateOrModifyForm
        modalVisible={editModal.visible}
        onCancel={editModal.close}
        refresh={fetchProductDetail}
        text={{
          title: '编辑产品',
          successMsg: '更新成功',
        }}
        api={submitProductForm}
        record={formInitialValues}
        idMapKey="product_id"
        ownForm={form}
      >
        <ProductFormFields />
      </CreateOrModifyForm>
    </div>
  );
};

export default ProductDetail;
