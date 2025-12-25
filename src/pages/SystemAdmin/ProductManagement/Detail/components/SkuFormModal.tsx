import RichTextEditor from '@/components/BasicComponents/RichTextEditor';
import { AttrAPI } from '@/services/system/attr/AttrController';
import type { Attr, AttrValueInfo } from '@/services/system/attr/typings';
import type { SkuDetailResponse } from '@/services/system/sku/typings';
import { StatusInfo } from '@/types/common';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Modal, Select, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;

interface SkuFormModalProps {
  visible: boolean;
  productId: number;
  editingSku: SkuDetailResponse | null;
  form: any;
  onSubmit: () => void;
  onCancel: () => void;
}

const SkuFormModal: React.FC<SkuFormModalProps> = ({
  visible,
  productId,
  editingSku,
  form,
  onSubmit,
  onCancel,
}) => {
  const [attrs, setAttrs] = useState<(Attr & { status?: StatusInfo })[]>([]);
  const [attrValueMap, setAttrValueMap] = useState<
    Record<string, AttrValueInfo[]>
  >({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);

  const loadAttrs = async () => {
    setLoadingAttrs(true);
    try {
      const response = await AttrAPI.getAttrList({
        product_id: productId,
        needActive: true,
      });
      const attrsList = response.data.attrs;
      setAttrs(attrsList);

      // 获取每个属性的值列表
      const valueMap: Record<string, AttrValueInfo[]> = {};
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
      setAttrValueMap(valueMap);
    } catch (error) {
      console.error('获取属性列表失败:', error);
      message.error('获取属性列表失败');
    } finally {
      setLoadingAttrs(false);
    }
  };

  // 获取属性列表和属性值
  useEffect(() => {
    if (visible && productId) {
      loadAttrs();
    }
  }, [visible, productId]);

  // 加载编辑数据
  useEffect(() => {
    if (visible && editingSku) {
      // 处理属性对：转换为对象格式 { attr_code: value_code }
      const attrPairsObj: Record<string, string> = {};
      if (editingSku.attr_pairs) {
        editingSku.attr_pairs.forEach((pair) => {
          if (pair.attr_code && pair.value_code) {
            attrPairsObj[pair.attr_code] = pair.value_code;
          }
        });
      }

      // 设置表单值
      form.setFieldsValue({
        sku_name: editingSku.sku_name,
        remark: editingSku.remark,
        specification: editingSku.specification,
        attr_pairs: attrPairsObj,
        third_code: editingSku.third_code,
      });

      // 设置图片列表
      if (editingSku.photos && editingSku.photos.length > 0) {
        const files: UploadFile[] = editingSku.photos.map((photo, index) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          status: 'done',
          url: photo.url || photo.path,
        }));
        setFileList(files);
        form.setFieldsValue({
          photos: editingSku.photos.map((p) => p.url || p.path).filter(Boolean),
        });
      } else {
        setFileList([]);
      }
    } else if (visible && !editingSku) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, editingSku, form]);

  return (
    <Modal
      title={editingSku ? '编辑 SKU' : '新增 SKU'}
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      width={800}
      loading={loadingAttrs}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="sku_name"
          label="SKU 名称"
          rules={[{ required: true, message: '请输入 SKU 名称' }]}
        >
          <Input placeholder="请输入 SKU 名称" />
        </Form.Item>

        {attrs.length > 0 && (
          <Form.Item
            name="attr_pairs"
            label="销售属性"
            rules={[{ required: true, message: '请选择销售属性组合' }]}
          >
            <div>
              {attrs.map((attr) => (
                <Form.Item
                  key={attr.attr_code}
                  name={['attr_pairs', attr.attr_code]}
                  rules={[
                    { required: true, message: `请选择${attr.attr_name}` },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Select
                    placeholder={`请选择${attr.attr_name}`}
                    disabled={!!editingSku}
                  >
                    {(attrValueMap[attr.attr_code] || []).map((value) => (
                      <Select.Option
                        key={value.value_code}
                        value={value.value_code}
                      >
                        {value.value_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ))}
            </div>
          </Form.Item>
        )}

        <Form.Item
          label="产品编码"
          name="third_code"
          rules={[{ required: true, message: '请输入产品编码' }]}
        >
          <Input placeholder="请输入产品编码" />
        </Form.Item>

        {editingSku ? null : (
          <>
            <Form.Item
              label="原厂价"
              name="origin_price"
              rules={[{ required: true, message: '请输入原厂价' }]}
            >
              <InputNumber
                addonBefore="¥"
                addonAfter="元"
                precision={2}
                placeholder="请输入原厂价"
              />
            </Form.Item>

            <Form.Item label="建议零售价" name="ceiling_price">
              <InputNumber
                addonBefore="¥"
                addonAfter="元"
                precision={2}
                placeholder="请输入建议零售价"
              />
            </Form.Item>

            <Form.Item label="回采价" name="return_purchase_price">
              <InputNumber
                addonBefore="¥"
                addonAfter="元"
                precision={2}
                placeholder="请输入回采价"
              />
            </Form.Item>
          </>
        )}

        <Form.Item label="SKU 图片" name="photos">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => {
              setFileList(newFileList);
              // 将文件列表转换为 URL 数组
              const urls = newFileList
                .map((file) => file.url || file.response?.url)
                .filter(Boolean);
              form.setFieldsValue({ photos: urls });
            }}
            beforeUpload={() => false}
          >
            {fileList.length < 5 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          label="规格说明"
          name="specification"
          getValueFromEvent={(value) => value}
        >
          <RichTextEditor placeholder="请输入规格说明..." height={300} />
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SkuFormModal;
