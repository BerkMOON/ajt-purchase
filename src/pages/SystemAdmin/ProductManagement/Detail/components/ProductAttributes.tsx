import { AttrAPI } from '@/services/system/attr/AttrController';
import type { Attr, AttrValue } from '@/services/system/attr/typings';
import { StatusInfo } from '@/types/common';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Space } from 'antd';
import React, { useState } from 'react';
import AttributeCard from './AttributeCard';
import AttributeFormModal from './AttributeFormModal';
import AttributeValueFormModal from './AttributeValueFormModal';
import { useProductAttributes } from './hooks/useProductAttributes';

interface ProductAttributesProps {
  productId: number;
}

const ProductAttributes: React.FC<ProductAttributesProps> = ({ productId }) => {
  const {
    attrs,
    loading,
    attrValueMap,
    fetchAttrs,
    handleDeleteAttr,
    handleChangeAttrStatus,
    handleDeleteValue,
    handleChangeValueStatus,
  } = useProductAttributes(productId);

  const [attrForm] = Form.useForm();
  const [valueForm] = Form.useForm();
  const [attrModalVisible, setAttrModalVisible] = useState(false);
  const [valueModalVisible, setValueModalVisible] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attr | null>(null);
  const [editingValue, setEditingValue] = useState<{
    attr: Attr & { status?: StatusInfo };
    value: any;
  } | null>(null);

  // 打开新增属性弹窗
  const handleAddAttr = () => {
    setEditingAttr(null);
    attrForm.resetFields();
    setAttrModalVisible(true);
  };

  // 打开编辑属性弹窗
  const handleEditAttr = (attr: Attr & { status?: StatusInfo }) => {
    setEditingAttr(attr);
    attrForm.setFieldsValue({
      attr_name: attr.attr_name,
      sort: attr.sort,
    });
    setAttrModalVisible(true);
  };

  // 提交属性表单
  const handleSubmitAttr = async () => {
    try {
      const values = await attrForm.validateFields();
      if (editingAttr) {
        // 更新属性
        await AttrAPI.updateAttr({
          attr_code: editingAttr.attr_code,
          product_id: productId,
          attr_name: values.attr_name,
          sort: values.sort,
        });
        message.success('更新成功');
      } else {
        // 新增属性
        const attrValues: AttrValue[] = (values.values || []).map(
          (val: any) => ({
            value_code:
              val.value_code || `value_${Date.now()}_${Math.random()}`,
            value_name: val.value_name,
            sort: val.sort || 0,
          }),
        );

        await AttrAPI.appendAttr({
          product_id: productId,
          attr: {
            attr_code: values.attr_code || `attr_${Date.now()}`,
            attr_name: values.attr_name,
            sort: values.sort || 0,
            values: attrValues,
          },
        });
        message.success('新增成功');
      }
      setAttrModalVisible(false);
      fetchAttrs();
    } catch (error) {
      console.error('保存属性失败:', error);
      message.error('保存失败');
    }
  };

  // 打开新增属性值弹窗
  const handleAddValue = (attr: Attr & { status?: StatusInfo }) => {
    setEditingValue({ attr, value: null });
    valueForm.resetFields();
    setValueModalVisible(true);
  };

  // 打开编辑属性值弹窗
  const handleEditValue = (
    attr: Attr & { status?: StatusInfo },
    value: any,
  ) => {
    setEditingValue({ attr, value });
    valueForm.setFieldsValue({
      value_code: value.value_code,
      value_name: value.value_name,
      sort:
        typeof value.sort === 'string'
          ? parseInt(value.sort) || 0
          : value.sort || 0,
    });
    setValueModalVisible(true);
  };

  // 提交属性值表单
  const handleSubmitValue = async () => {
    if (!editingValue) return;
    try {
      const values = await valueForm.validateFields();
      if (editingValue.value) {
        // 更新属性值
        await AttrAPI.updateAttrValue({
          attr_code: editingValue.attr.attr_code,
          product_id: productId,
          value_code: editingValue.value.value_code,
          value_name: values.value_name,
          sort: values.sort || 0,
        });
        message.success('更新成功');
      } else {
        // 新增属性值
        await AttrAPI.appendAttrValue({
          attr_code: editingValue.attr.attr_code,
          product_id: productId,
          value_code: values.value_code,
          value_name: values.value_name,
          sort: values.sort || 0,
        });
        message.success('新增成功');
      }
      setValueModalVisible(false);
      fetchAttrs();
    } catch (error) {
      console.error('保存属性值失败:', error);
      message.error('保存失败');
    }
  };

  return (
    <>
      <Card
        title="销售属性"
        extra={
          <Space>
            <Button type="link" icon={<SyncOutlined />} onClick={fetchAttrs}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAttr}
            >
              新增属性
            </Button>
          </Space>
        }
        loading={loading}
      >
        {attrs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无销售属性，请添加
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {attrs.map((attr) => (
              <AttributeCard
                key={attr.attr_code}
                attr={attr}
                values={attrValueMap[attr.attr_code] || []}
                onAddValue={handleAddValue}
                onEditAttr={handleEditAttr}
                onDeleteAttr={handleDeleteAttr}
                onChangeAttrStatus={handleChangeAttrStatus}
                onEditValue={handleEditValue}
                onDeleteValue={handleDeleteValue}
                onChangeValueStatus={handleChangeValueStatus}
              />
            ))}
          </Space>
        )}
      </Card>

      <AttributeFormModal
        visible={attrModalVisible}
        editingAttr={editingAttr}
        form={attrForm}
        onSubmit={handleSubmitAttr}
        onCancel={() => setAttrModalVisible(false)}
      />

      <AttributeValueFormModal
        visible={valueModalVisible}
        isEdit={!!editingValue?.value}
        form={valueForm}
        onSubmit={handleSubmitValue}
        onCancel={() => setValueModalVisible(false)}
      />
    </>
  );
};

export default ProductAttributes;
