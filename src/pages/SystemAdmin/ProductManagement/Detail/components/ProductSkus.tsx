import { SkuAPI } from '@/services/system/sku/SkuController';
import { formatPriceToFen } from '@/utils/prince';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Space } from 'antd';
import React, { useState } from 'react';
import SkuFormModal from './SkuFormModal';
import SkuTable from './SkuTable';
import { useProductSkus } from './hooks/useProductSkus';

interface ProductSkusProps {
  productId: number;
}

const ProductSkus: React.FC<ProductSkusProps> = ({ productId }) => {
  const { skus, loading, fetchSkus, handleDeleteSku, handleChangeSkuStatus } =
    useProductSkus(productId);

  const [skuForm] = Form.useForm();
  const [skuModalVisible, setSkuModalVisible] = useState(false);

  // 打开新增 SKU 弹窗
  const handleAddSku = () => {
    skuForm.resetFields();
    setSkuModalVisible(true);
  };

  // 提交 SKU 表单（仅用于新增）
  const handleSubmitSku = async () => {
    try {
      const values = await skuForm.validateFields();

      // 处理属性对：将表单中的对象格式转换为数组格式
      const attrPairs: Array<{ attr_code: string; value_code: string }> = [];
      if (values.attr_pairs) {
        Object.keys(values.attr_pairs).forEach((attrCode) => {
          const valueCode = values.attr_pairs[attrCode];
          if (valueCode) {
            attrPairs.push({
              attr_code: attrCode,
              value_code: valueCode,
            });
          }
        });
      }

      // 新增 SKU
      await SkuAPI.createSku({
        product_id: productId,
        sku_name: values.sku_name,
        attr_pairs: attrPairs,
        photos: values.photos,
        remark: values.remark,
        specification: values.specification,
        third_code: values.third_code,
        price_info: {
          origin_price: formatPriceToFen(values.origin_price),
          ...(values.ceiling_price
            ? { ceiling_price: formatPriceToFen(values.ceiling_price) }
            : {}),
          ...(values.return_purchase_price
            ? {
                return_purchase_price: formatPriceToFen(
                  values.return_purchase_price,
                ),
              }
            : {}),
        },
      });
      message.success('新增成功');
      setSkuModalVisible(false);
      fetchSkus();
    } catch (error) {
      console.error('保存 SKU 失败:', error);
      message.error('保存失败');
    }
  };

  return (
    <>
      <Card
        title="SKU 管理"
        extra={
          <Space>
            <Button type="link" icon={<SyncOutlined />} onClick={fetchSkus}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSku}
            >
              新增 SKU
            </Button>
          </Space>
        }
        loading={loading}
      >
        {skus.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无 SKU，请添加
          </div>
        ) : (
          <SkuTable
            skus={skus}
            onDelete={handleDeleteSku}
            onChangeStatus={handleChangeSkuStatus}
          />
        )}
      </Card>

      <SkuFormModal
        visible={skuModalVisible}
        productId={productId}
        editingSku={null}
        form={skuForm}
        onSubmit={handleSubmitSku}
        onCancel={() => setSkuModalVisible(false)}
      />
    </>
  );
};

export default ProductSkus;
