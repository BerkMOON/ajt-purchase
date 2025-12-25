import CategoryCascader from '@/components/BasicComponents/CategoryCascader';
import { AliyunOSSUpload } from '@/components/BasicComponents/OSSUpload';
import { BrandAPI } from '@/services/system/brand/BrandController';
import type { BrandDetailResponse } from '@/services/system/brand/typings';
import { OssAPI } from '@/services/system/oss/OssController';
import { FileExcelOutlined } from '@ant-design/icons';
import { Navigate, useAccess } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  message,
  Select,
  Space,
  Spin,
  Typography,
  UploadFile,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

const SkuUpload: React.FC = () => {
  const { isLogin } = useAccess();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    path: string;
    name: string;
    md5: string;
  } | null>(null);
  const [brands, setBrands] = useState<BrandDetailResponse[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [importing, setImporting] = useState(false);
  const [, setSelectedBrandName] = useState<string>('');
  const [selectedCategoryLabels, setSelectedCategoryLabels] = useState<
    string[]
  >([]);

  // 加载品牌列表
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await BrandAPI.getList({
          page: 1,
          limit: 1000,
        });
        setBrands(response.data.brands || []);
      } catch (error) {
        console.error('加载品牌列表失败:', error);
        message.error('加载品牌列表失败');
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  const handleImport = async (ossPath: string) => {
    try {
      const values = await form.validateFields(['brand_id', 'category_id']);

      // 处理品类：category_id 可能是数组（级联选择器的值）
      let categoryId: number;

      if (Array.isArray(values.category_id)) {
        // 如果是数组，取最后一个值作为 category_id
        categoryId = values.category_id[values.category_id.length - 1];
        // 构建路径（需要从级联选择器中获取标签）
      } else {
        categoryId = values.category_id;
      }

      setImporting(true);
      await OssAPI.importPartExcel({
        brand_id: values.brand_id,
        category_id: categoryId,
        oss_path: ossPath,
      });

      message.success('Excel 文件导入成功！');
    } catch (error: any) {
      // 如果是表单验证错误，不显示错误消息（让用户填写表单）
      if (error?.errorFields) {
        message.warning('请先选择品牌和品类');
        return;
      }
      console.error('导入失败:', error);
      message.error(error?.message || '导入失败，请重试');
    } finally {
      setImporting(false);
    }
  };

  const handleUploadSuccess = async (fileInfo: {
    path: string;
    name: string;
    md5: string;
  }) => {
    setUploadResult(fileInfo);
    message.success('文件上传成功！');

    // 上传成功后自动调用导入接口
    await handleImport(fileInfo.path);
  };

  const handleManualImport = async () => {
    if (!uploadResult) {
      message.warning('请先上传文件');
      return;
    }
    await handleImport(uploadResult.path);
  };

  const handleFileListChange = (newFileList: UploadFile[]) => {
    setFileList(newFileList);
    // 如果文件被移除，清空上传结果
    if (newFileList.length === 0) {
      setUploadResult(null);
    }
  };

  // 监听表单值，判断是否禁用上传按钮
  const brandId = Form.useWatch('brand_id', form);
  const categoryId = Form.useWatch('category_id', form);

  // 判断是否应该禁用上传按钮
  const isUploadDisabled = useMemo(() => {
    return !brandId || !categoryId;
  }, [brandId, categoryId]);

  // 生成文件名：品类_品牌_时间戳.xlsx
  const generateFileName = (originalFileName: string): string => {
    const formValues = form.getFieldsValue();
    const brandId = formValues.brand_id;
    const categoryId = formValues.category_id;

    // 获取品牌名称
    let brandName = '';
    if (brandId) {
      const brand = brands.find((b) => b.id === brandId);
      brandName = brand?.brand_name || '';
    }

    // 获取品类名称（使用保存的标签或尝试从值中获取）
    let categoryName = '';
    if (selectedCategoryLabels.length > 0) {
      // 使用最后一级品类名称
      categoryName = selectedCategoryLabels[selectedCategoryLabels.length - 1];
    } else if (Array.isArray(categoryId) && categoryId.length > 0) {
      categoryName = String(categoryId[categoryId.length - 1]);
    } else if (categoryId) {
      categoryName = String(categoryId);
    }

    // 生成时间戳（格式：YYYYMMDDHHmmss）
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
      .replace('T', '');

    // 获取文件扩展名
    const extension = originalFileName.slice(originalFileName.lastIndexOf('.'));

    // 清理名称中的特殊字符（替换为下划线）
    const cleanBrandName = brandName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
    const cleanCategoryName = categoryName.replace(/[^\w\u4e00-\u9fa5]/g, '_');

    // 组合文件名：品类_品牌_时间戳.xlsx
    const parts = [cleanBrandName, cleanCategoryName, timestamp].filter(
      Boolean,
    );

    return parts.join('_') + extension;
  };

  // 处理品牌选择变化
  const handleBrandChange = (brandId: number) => {
    const brand = brands.find((b) => b.id === brandId);
    setSelectedBrandName(brand?.brand_name || '');
  };

  // 处理品类选择变化
  const handleCategoryChange = (value: any, selectedOptions?: any[]) => {
    if (selectedOptions && selectedOptions.length > 0) {
      // 提取标签
      const labels = selectedOptions.map((option) => option.label);
      setSelectedCategoryLabels(labels);
    } else {
      setSelectedCategoryLabels([]);
    }
  };

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>
              <FileExcelOutlined style={{ marginRight: 8 }} />
              SKU 文件上传
            </Title>
            <Paragraph type="secondary">
              上传包含 SKU 信息的 Excel 文件，系统将自动处理导入
            </Paragraph>
          </div>

          <Divider />

          <Alert
            message="上传说明"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>仅支持 Excel 格式文件（.xlsx 或 .xls）</li>
                <li>文件大小建议不超过 50MB</li>
                <li>上传成功后，系统将自动处理文件内容</li>
                <li>请确保 Excel 文件包含正确的 SKU 数据格式</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card
            title="选择文件"
            style={{ backgroundColor: '#fafafa' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Form form={form} layout="vertical">
                <Form.Item
                  label="品牌"
                  name="brand_id"
                  rules={[{ required: true, message: '请选择品牌' }]}
                >
                  <Select
                    placeholder="请选择品牌"
                    loading={loadingBrands}
                    allowClear
                    onChange={handleBrandChange}
                  >
                    {brands.map((brand) => (
                      <Select.Option key={brand.id} value={brand.id}>
                        {brand.brand_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="品类"
                  name="category_id"
                  rules={[{ required: true, message: '请选择品类' }]}
                >
                  <CategoryCascader
                    placeholder="请选择品类"
                    changeOnSelect={false}
                    onChange={handleCategoryChange}
                  />
                </Form.Item>
              </Form>
              <AliyunOSSUpload
                value={fileList}
                onChange={handleFileListChange}
                onUploadSuccess={handleUploadSuccess}
                generateFileName={generateFileName}
                disabled={isUploadDisabled}
              />
              <Text type="secondary">点击上方按钮选择 Excel 文件进行上传</Text>
            </Space>
          </Card>

          {uploadResult && (
            <Card
              title="上传结果"
              style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <div>
                  <Text strong>文件名称：</Text>
                  <Text>{uploadResult.name}</Text>
                </div>
                <div>
                  <Text strong>文件路径：</Text>
                  <Text code>{uploadResult.path}</Text>
                </div>
                <div>
                  <Text strong>MD5 值：</Text>
                  <Text code>{uploadResult.md5}</Text>
                </div>
                <Alert
                  message="上传成功"
                  description={
                    importing
                      ? '正在导入文件，请稍候...'
                      : '文件已成功上传到服务器，系统正在处理中...'
                  }
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
                {!importing && uploadResult && (
                  <Button
                    type="primary"
                    onClick={handleManualImport}
                    style={{ marginTop: 16 }}
                  >
                    重新导入
                  </Button>
                )}
                {importing && (
                  <Spin style={{ marginTop: 16 }} tip="正在导入..." />
                )}
              </Space>
            </Card>
          )}

          {fileList.length > 0 && fileList[0].status === 'uploading' && (
            <Alert
              message="正在上传"
              description="文件上传中，请稍候..."
              type="info"
              showIcon
            />
          )}

          {fileList.length > 0 && fileList[0].status === 'error' && (
            <Alert
              message="上传失败"
              description="文件上传失败，请检查文件格式或网络连接后重试"
              type="error"
              showIcon
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default SkuUpload;
