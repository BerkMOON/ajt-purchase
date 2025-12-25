export interface OssConfig {
  policy: string;
  signature: string;
  ossAccessKeyId: string;
  host: string;
  dir: string;
}

export interface UploadFileParams {
  business_type: 'product_import';
  file_name: string;
  file_type: string;
}

export interface ImportPartExcelParams {
  brand_id: number;
  category_id: number;
  oss_path: string;
}
