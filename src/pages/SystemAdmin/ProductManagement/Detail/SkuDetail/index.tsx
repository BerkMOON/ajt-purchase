import RichTextViewer from '@/components/BasicComponents/RichTextViewer';
import { COMMON_CATEGORY_STATUS_CODE } from '@/constants';
import { SkuAPI } from '@/services/system/sku/SkuController';
import type { SkuDetailResponse } from '@/services/system/sku/typings';
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
import SkuFormModal from '../components/SkuFormModal';

const SkuDetail: React.FC = () => {
  const { isLogin } = useAccess();
  const { id } = useParams<{ id: string }>();
  const [sku, setSku] = useState<SkuDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [skuForm] = Form.useForm();

  const fetchSkuDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await SkuAPI.getSkuDetail(Number(id));
      setSku(response.data);
    } catch (error) {
      console.error('获取 SKU 详情失败:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 打开编辑弹窗
  const handleEdit = () => {
    if (sku) {
      setEditModalVisible(true);
    }
  };

  // 提交编辑表单
  const handleSubmitEdit = async () => {
    if (!sku?.sku_id) return;
    try {
      const values = await skuForm.validateFields();
      await SkuAPI.updateSku({
        sku_id: sku.sku_id,
        sku_name: values.sku_name,
        photos: values.photos,
        remark: values.remark,
        specification: values.specification,
      });
      message.success('更新成功');
      setEditModalVisible(false);
      fetchSkuDetail();
    } catch (error) {
      console.error('更新 SKU 失败:', error);
      message.error('更新失败');
    }
  };

  useEffect(() => {
    fetchSkuDetail();
  }, [fetchSkuDetail]);

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

  if (!sku) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>SKU 不存在或已被删除</p>
            <Button onClick={() => history.back()}>返回</Button>
          </div>
        </Card>
      </div>
    );
  }

  const isActive = sku.status?.code === COMMON_CATEGORY_STATUS_CODE.ACTIVE;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            返回
          </Button>
          {sku && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
          )}
        </Space>

        <Descriptions title="SKU 信息" bordered>
          <Descriptions.Item label="SKU ID">{sku.sku_id}</Descriptions.Item>
          <Descriptions.Item label="SKU 名称">
            {sku.sku_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {isActive ? (
              <Tag color="success">启用</Tag>
            ) : (
              <Tag color="default">停用</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="产品 ID">
            {sku.product_id || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {sku.create_time || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {sku.modify_time || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="销售属性" span={3}>
            {sku.attr_pairs && sku.attr_pairs.length > 0 ? (
              <Space wrap>
                {sku.attr_pairs.map((pair, index) => (
                  <Tag key={index} color="blue">
                    {pair.attr_name || pair.attr_code || ''}:{' '}
                    {pair.value_name || pair.value_code || ''}
                  </Tag>
                ))}
              </Space>
            ) : (
              <span style={{ color: '#999' }}>-</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={3}>
            {sku.remark || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="规格说明" span={3}>
            <RichTextViewer content={sku.specification} />
          </Descriptions.Item>
          {sku.photos && sku.photos.length > 0 && (
            <Descriptions.Item label="SKU 图片" span={3}>
              <Row gutter={[16, 16]}>
                {sku.photos.map((photo, index) => (
                  <Col key={index}>
                    <img
                      src={photo.url || photo.path}
                      alt={`SKU 图片 ${index + 1}`}
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

      {sku && (
        <SkuFormModal
          visible={editModalVisible}
          productId={sku.product_id || 0}
          editingSku={sku}
          form={skuForm}
          onSubmit={handleSubmitEdit}
          onCancel={() => setEditModalVisible(false)}
        />
      )}
    </div>
  );
};

export default SkuDetail;
