import { OssAPI } from '@/services/system/oss/OssController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import SparkMD5 from 'spark-md5';

interface OSSDataType {
  dir: string;
  host: string;
  accessId: string;
  policy: string;
  signature: string;
}

interface AliyunOSSUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  onUploadSuccess?: (fileInfo: {
    path: string;
    name: string;
    md5: string;
  }) => void;
  generateFileName?: (originalFileName: string) => string;
  disabled?: boolean;
}

export const AliyunOSSUpload = ({
  value,
  onChange,
  onUploadSuccess,
  generateFileName,
  disabled = false,
}: AliyunOSSUploadProps) => {
  const [OSSData, setOSSData] = useState<OSSDataType>();
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // 计算文件的 MD5
  const calculateMD5 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const buffer = e.target?.result;
        const spark = new SparkMD5.ArrayBuffer();
        spark.append(buffer as ArrayBuffer);
        const md5 = spark.end();
        resolve(md5);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange: UploadProps['onChange'] = async ({ fileList, file }) => {
    if (file.status === 'done') {
      const md5 = await calculateMD5(file.originFileObj as File);
      // 使用实际上传的文件名（如果存在），否则使用 file.url
      const finalFileName = uploadedFileName || (file.url as string);
      onUploadSuccess?.({
        path: `${OSSData?.dir}${finalFileName}`,
        name: finalFileName,
        md5: md5,
      });
      // 清空保存的文件名
      setUploadedFileName('');
    }
    onChange?.([...fileList]);
  };

  const onRemove = (file: UploadFile) => {
    const files = (value || []).filter((v) => v.url !== file.url);

    if (onChange) {
      onChange(files);
    }
  };

  useEffect(() => {
    if (value && value.length > 0) {
      onRemove(value?.[0]);
    }
  }, []);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // 检查是否为 Excel 文件
    const isExcel =
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls');

    if (!isExcel) {
      message.error('只能上传 Excel 文件（.xlsx 或 .xls）！');
      return Upload.LIST_IGNORE;
    }

    // 使用原始文件名
    // @ts-ignore
    file.url = file.name;

    return true; // 允许继续上传流程
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    const uploadFile = file as File;

    try {
      // 生成文件名：如果有自定义生成函数则使用，否则使用原始文件名
      let filename: string;
      if (generateFileName) {
        filename = generateFileName(uploadFile.name);
      } else {
        filename = uploadFile.name;
      }

      // 保存生成的文件名，用于后续构建 path
      setUploadedFileName(filename);

      // 获取 OSS 配置
      const {
        data: { dir, host, ossAccessKeyId, policy, signature },
      } = await OssAPI.getOSSConfig({
        business_type: 'product_import',
        file_name: filename,
        file_type:
          uploadFile.type ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // 设置 OSS 数据
      const ossData = {
        dir,
        host,
        accessId: ossAccessKeyId,
        policy,
        signature,
      };
      setOSSData(ossData);

      // 创建 FormData
      const formData = new FormData();
      formData.append('key', `${dir}${filename}`);
      formData.append('OSSAccessKeyId', ossData.accessId);
      formData.append('policy', ossData.policy);
      formData.append('Signature', ossData.signature);
      formData.append('success_action_status', '200');
      formData.append('file', uploadFile);

      // 上传文件到 OSS
      const xhr = new XMLHttpRequest();

      // 监听上传进度
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress({ percent });
        }
      });

      // 监听上传完成
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 204) {
          // 上传成功，触发 onChange 回调
          if (onSuccess) {
            onSuccess({}, xhr);
          }
        } else {
          if (onError) {
            onError(new Error(`上传失败: ${xhr.statusText}`));
          }
        }
      });

      // 监听错误
      xhr.addEventListener('error', () => {
        if (onError) {
          onError(new Error('上传失败：网络错误'));
        }
      });

      // 发送请求
      xhr.open('POST', host);
      xhr.send(formData);
    } catch (error: any) {
      console.error('上传失败:', error);
      message.error(error?.message || '获取上传配置失败');
      if (onError) {
        onError(error);
      }
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    maxCount: 1,
    fileList: value,
    onChange: handleChange,
    onRemove,
    beforeUpload,
    customRequest,
    disabled,
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />} disabled={disabled}>
        点击上传
      </Button>
    </Upload>
  );
};
